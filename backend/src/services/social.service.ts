import crypto from 'crypto';
import { config } from '../config';
import { SocialLoginInput } from '../schemas/auth.schema';
import { Json } from '../types/common.types';
import { SocialServiceDeps } from '../types/service.types';
import { AuthUser, SocialProfile, SocialProvider } from '../types/user.types';
import { AppError } from '../utils/errors';

const PROVIDER_TIMEOUT_MS = 8000;
const MAX_USERNAME_LENGTH = 20;

const invalidToken = (provider: string) =>
  new AppError(`The ${provider} token is not valid.`, 400, 'invalid_credentials');

const notConfigured = (provider: string) =>
  new AppError(`${provider} sign-in is not configured on this server.`, 503, 'not_configured');

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

async function requestJson(provider: string, url: string, init: RequestInit = {}): Promise<Json> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  } catch {
    throw new AppError(`${provider} could not be reached. Please try again.`, 502, 'bad_request');
  }
  if (!response.ok) throw invalidToken(provider);
  return (await response.json()) as Json;
}

const bearer = (token: string): RequestInit => ({ headers: { Authorization: `Bearer ${token}` } });

// Each provider is asked two things: is this token real, and was it issued to *this* application.
// Skipping the second check would let a token obtained by any other site that uses the same
// provider sign in here as that person (OWASP API2, "confused deputy")
const providers: Record<SocialProvider, (input: SocialLoginInput) => Promise<SocialProfile>> = {
  async google({ access_token: token }) {
    const clientId = config.social.googleClientId;
    if (!clientId) throw notConfigured('Google');

    const info = await requestJson(
      'Google',
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`,
    );
    if (info.aud !== clientId && info.azp !== clientId) throw invalidToken('Google');

    const profile = await requestJson(
      'Google',
      'https://www.googleapis.com/oauth2/v3/userinfo',
      bearer(token),
    );
    const uid = text(profile.sub);
    if (!uid) throw invalidToken('Google');

    return {
      uid,
      email: profile.email_verified === true ? (text(profile.email) ?? null) : null,
      name: text(profile.name) ?? 'Google user',
      firstName: text(profile.given_name),
      lastName: text(profile.family_name),
      extraData: profile,
    };
  },

  async facebook({ access_token: token }) {
    const { facebookAppId: appId, facebookAppSecret: appSecret } = config.social;
    if (!appId || !appSecret) throw notConfigured('Facebook');

    const debug = await requestJson(
      'Facebook',
      `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(token)}` +
        `&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`,
    );
    const data = (debug.data ?? {}) as Json;
    if (data.is_valid !== true || String(data.app_id) !== appId) throw invalidToken('Facebook');

    const profile = await requestJson(
      'Facebook',
      `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture` +
        `&access_token=${encodeURIComponent(token)}`,
    );
    const uid = text(profile.id);
    if (!uid) throw invalidToken('Facebook');

    return {
      uid,
      email: text(profile.email) ?? null,
      name: text(profile.name) ?? 'Facebook user',
      firstName: text(profile.first_name),
      lastName: text(profile.last_name),
      extraData: profile,
    };
  },

  async line({ access_token: token, id_token: idToken }) {
    const channelId = config.social.lineChannelId;
    if (!channelId) throw notConfigured('LINE');

    const verified = await requestJson(
      'LINE',
      `https://api.line.me/oauth2/v2.1/verify?access_token=${encodeURIComponent(token)}`,
    );
    if (String(verified.client_id) !== channelId || !(Number(verified.expires_in) > 0)) {
      throw invalidToken('LINE');
    }

    const profile = await requestJson('LINE', 'https://api.line.me/v2/profile', bearer(token));
    const uid = text(profile.userId);
    if (!uid) throw invalidToken('LINE');

    let email: string | null = null;
    if (idToken) {
      const claims = await requestJson('LINE', 'https://api.line.me/oauth2/v2.1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
      });
      if (claims.sub !== uid) throw invalidToken('LINE');
      email = text(claims.email) ?? null;
    }

    const name = text(profile.displayName) ?? 'LINE user';
    return {
      uid,
      email,
      name,
      extraData: { userId: uid, name, picture: text(profile.pictureUrl) ?? '', email },
    };
  },
};

export function createSocialService({ users, socials, accounts }: SocialServiceDeps) {
  async function availableUsername(profile: SocialProfile, provider: SocialProvider): Promise<string> {
    const source = profile.email?.split('@')[0] ?? profile.name;
    const base =
      source
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, '')
        .slice(0, MAX_USERNAME_LENGTH) || provider;

    if (base.length >= 4 && !(await users.usernameExists(base))) return base;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `${base.slice(0, MAX_USERNAME_LENGTH - 5)}_${crypto.randomInt(1000, 10000)}`;
      if (!(await users.usernameExists(candidate))) return candidate;
    }
    return `${provider}_${crypto.randomUUID().slice(0, 8)}`;
  }

  return {
    async signIn(
      provider: SocialProvider,
      input: SocialLoginInput,
      currentUserId: number | null,
    ): Promise<AuthUser> {
      const profile = await providers[provider](input);
      const existing = await socials.find(provider, profile.uid);

      if (currentUserId !== null) {
        if (existing && existing.userId !== currentUserId) {
          throw new AppError('This social account is already connected to another user.', 400, 'conflict');
        }
        const user = await users.findAuthById(currentUserId);
        if (!user) throw new AppError('Invalid token.', 401, 'token_invalid');
        await socials.link(currentUserId, provider, profile.uid, profile.extraData);
        return user;
      }

      if (existing) {
        const user = await users.findAuthById(existing.userId);
        if (!user) throw invalidToken(provider);
        await socials.link(user.id, provider, profile.uid, profile.extraData);
        return user;
      }

      // A social identity is never attached to an existing account just because the e-mail
      // matches: whoever controls that address at the provider would take the account over.
      // The owner signs in first and connects the provider from the profile page instead.
      if (profile.email && (await users.emailExists(profile.email))) {
        throw new AppError(
          'An account already exists with this e-mail address. Sign in and connect it from your profile.',
          400,
          'conflict',
        );
      }

      const user = await accounts.createAccount({
        username: await availableUsername(profile, provider),
        email: profile.email,
        passwordHash: null,
        firstName: profile.firstName ?? profile.name,
        lastName: profile.lastName ?? '',
      });
      await socials.link(user.id, provider, profile.uid, profile.extraData);
      return user;
    },
  };
}

export type SocialService = ReturnType<typeof createSocialService>;
