import { withTransaction } from '../database';
import {
  EMAIL_TAKEN,
  INVALID_EMAIL,
  INVALID_USERNAME,
  isTooSimilar,
  isValidEmail,
  isValidUsername,
  PASSWORD_MISMATCH,
  PASSWORD_TOO_SIMILAR,
  passwordProblems,
  RegistrationInput,
  USERNAME_TAKEN,
} from '../schemas/auth.schema';
import { UserUpdateInput } from '../schemas/user.schema';
import { FieldErrors } from '../types/error.types';
import { UserServiceDeps } from '../types/service.types';
import { SOCIAL_PROVIDERS, SocialLink, SocialProvider } from '../types/social.types';
import { AuthUser, NewUserRow, UserDetails } from '../types/user.types';
import { AppError, fieldError } from '../utils/errors';
import { hashPassword, spendVerifyTime, verifyPassword } from './password.service';

export const DEFAULT_WALLET_NAME = 'กระเป๋าหลัก';

const INVALID_ADDRESS = 'Invalid pk - object does not exist.';

export function createUserService({ users, socials, addresses, wallets, notifications }: UserServiceDeps) {
  async function findDetails(id: number): Promise<UserDetails | null> {
    const [details, accounts] = await Promise.all([users.findDetails(id), socials.listByUser(id)]);
    if (!details) return null;

    const linked = Object.fromEntries(SOCIAL_PROVIDERS.map((provider) => [provider, null])) as Record<
      SocialProvider,
      SocialLink | null
    >;
    for (const account of accounts) {
      linked[account.provider] = { uid: account.uid, extra_data: account.extraData };
    }
    return { ...details, socials: linked };
  }

  async function requireDetails(id: number): Promise<UserDetails> {
    const details = await findDetails(id);
    if (!details) throw new AppError('Invalid token.', 401, 'token_invalid');
    return details;
  }

  // Every account starts with one wallet: the exchange page reads the first wallet without checking
  // that the list is non-empty
  async function createAccount(row: NewUserRow, welcome = true): Promise<AuthUser> {
    return withTransaction(async (tx) => {
      const user = await users.create(row, tx);
      await wallets.create(user.id, DEFAULT_WALLET_NAME, tx);
      if (welcome) {
        await notifications.create(
          user.id,
          {
            title: 'ยินดีต้อนรับ',
            message: 'ยินดีต้อนรับสู่ BTC-HUB เริ่มต้นใช้งานโดยดูที่อยู่โกดังจีนของคุณ',
            link: '/web/warehouse-address',
            linkText: 'ดูที่อยู่โกดังจีน',
          },
          tx,
        );
      }
      return user;
    });
  }

  return {
    findDetails,
    requireDetails,
    createAccount,

    findAuthUser(id: number): Promise<AuthUser | null> {
      return users.findAuthById(id);
    },

    findByUsername(username: string): Promise<AuthUser | null> {
      return users.findAuthByUsername(username);
    },

    async register(input: RegistrationInput): Promise<AuthUser> {
      const username = input.username.trim();
      const email = input.email.trim();
      const errors: FieldErrors = {};

      if (!isValidUsername(username)) errors.username = [INVALID_USERNAME];
      else if (await users.usernameExists(username)) errors.username = [USERNAME_TAKEN];

      if (!isValidEmail(email)) errors.email = [INVALID_EMAIL];
      else if (await users.emailExists(email)) errors.email = [EMAIL_TAKEN];

      const problems = passwordProblems(input.password1);
      if (problems.length) errors.password1 = problems;

      if (input.password1 !== input.password2) errors.non_field_errors = [PASSWORD_MISMATCH];
      else if (isTooSimilar(input.password1, username)) errors.non_field_errors = [PASSWORD_TOO_SIMILAR];

      if (Object.keys(errors).length) throw fieldError(errors);

      // Only these fields are read, so a "role" or "is_staff" sent here is ignored and
      // self-registration can never create a staff account (OWASP API3 mass assignment)
      return createAccount({
        username,
        email,
        passwordHash: await hashPassword(input.password1),
        referralCode: input.extendeduser?.referralCode ?? null,
      });
    },

    async authenticate(username: string, password: string): Promise<AuthUser | null> {
      const stored = await users.findCredentials(username);
      if (!stored?.passwordHash) {
        await spendVerifyTime();
        return null;
      }

      const matches = await verifyPassword(password, stored.passwordHash);
      if (!matches) return null;
      return { id: stored.id, username: stored.username, role: stored.role };
    },

    async updateDetails(id: number, input: UserUpdateInput): Promise<UserDetails> {
      const profile = input.extendeduser ?? {};

      // An address id is only accepted when that address belongs to the caller (OWASP API1)
      const addressErrors: Record<string, string[]> = {};
      for (const key of ['billingAddressId', 'shippingAddressId'] as const) {
        const addressId = profile[key];
        if (addressId != null && !(await addresses.findForUser(addressId, id))) {
          addressErrors[key] = [INVALID_ADDRESS];
        }
      }
      if (Object.keys(addressErrors).length) throw fieldError({ extendeduser: addressErrors });

      await users.update(id, {
        firstName: input.first_name,
        lastName: input.last_name,
        gender: profile.gender,
        telephone: profile.telephone,
        line: profile.line,
        facebook: profile.facebook,
        google: profile.google,
        affiliateName: profile.affiliateName,
        birthDate: profile.birthDate,
        billingAddressId: profile.billingAddressId,
        shippingAddressId: profile.shippingAddressId,
        hasConsent: profile.has_consent,
      });
      return requireDetails(id);
    },

    async revokeLineNotify(id: number): Promise<void> {
      await users.setLineNotify(id, false);
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
