import dotenv from 'dotenv';
import os from 'os';
import path from 'path';
import { z } from 'zod';

dotenv.config();

const MIN_SECRET_LENGTH = 32;
const DAY_MS = 24 * 60 * 60 * 1000;

const secret = z.string().min(MIN_SECRET_LENGTH, `must be at least ${MIN_SECRET_LENGTH} characters`);

const flag = (fallback: boolean) =>
  z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((value) => (value === undefined ? fallback : value === 'true' || value === '1'));

const R2_KEYS = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'] as const;

const envSchema = z
  .object({
    ENV: z.enum(['dev', 'test', 'production']).default('dev'),
    NODE_ENV: z.string().optional(),
    PORT: z.coerce.number().int().positive().default(3000),
    ALLOWED_ORIGIN: z.string().default('http://localhost:4200'),
    PUBLIC_URL: z.url().optional(),
    JSON_BODY_LIMIT: z.string().default('1mb'),
    TRUST_PROXY: z.coerce.number().int().min(0).default(1),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),

    API_RATE_LIMIT: z.coerce.number().int().positive().default(1000),
    AUTH_RATE_LIMIT: z.coerce.number().int().positive().default(30),

    TOKEN_SECRET: secret,
    ACCESS_TOKEN_EXPIRY: z.string().default('1h'),
    REFRESH_TOKEN_EXPIRY_DAYS: z.coerce.number().int().positive().max(365).default(7),
    REFRESH_COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).optional(),

    PASSWORD_PEPPER: secret,
    SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(10),

    DATABASE_URL: z.string().optional(),
    POSTGRES_HOST: z.string().default('127.0.0.1'),
    POSTGRES_PORT: z.coerce.number().int().positive().default(5433),
    POSTGRES_DB: z.string().default('btc_cargo_dev'),
    POSTGRES_TEST_DB: z.string().default('btc_cargo_test'),
    POSTGRES_USER: z.string().optional(),
    POSTGRES_PASSWORD: z.string().optional(),
    DATABASE_SSL: z.enum(['off', 'no-verify', 'verify']).optional(),
    DATABASE_SSL_CA: z.string().optional(),

    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    UPLOAD_DIR: z.string().default('uploads'),
    UPLOAD_MAX_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .max(25 * 1024 * 1024)
      .default(5 * 1024 * 1024),

    GOOGLE_CLIENT_ID: z.string().optional(),
    FACEBOOK_APP_ID: z.string().optional(),
    FACEBOOK_APP_SECRET: z.string().optional(),
    LINE_CHANNEL_ID: z.string().optional(),

    DEMO_AUTO_APPROVE_SECONDS: z.coerce.number().int().min(0).default(60),
    DEMO_LOGIN_ENABLED: flag(true),
    DEMO_USERNAME: z.string().min(4).max(16).default('demo'),
    DEMO_PASSWORD: z.string().min(8).max(128).default('demo1234'),
    DEMO_EMAIL: z.email().default('demo@btc-cargo.local'),
  })
  .refine((env) => env.DATABASE_URL || (env.POSTGRES_USER && env.POSTGRES_PASSWORD), {
    error: 'set DATABASE_URL, or POSTGRES_USER and POSTGRES_PASSWORD',
    path: ['DATABASE_URL'],
  })
  // A browser drops a SameSite=None cookie that is not also Secure, which would leave production
  // with no refresh cookie at all (OWASP API2)
  .refine((env) => env.REFRESH_COOKIE_SAMESITE !== 'none' || env.ENV === 'production', {
    error: "'none' needs the Secure flag, which is only set when ENV=production",
    path: ['REFRESH_COOKIE_SAMESITE'],
  })
  .refine((env) => R2_KEYS.every((key) => env[key]) || R2_KEYS.every((key) => !env[key]), {
    error: `set all of ${R2_KEYS.join(', ')}, or none of them`,
    path: ['R2_BUCKET'],
  })
  .refine((env) => Boolean(env.FACEBOOK_APP_ID) === Boolean(env.FACEBOOK_APP_SECRET), {
    error: 'set both FACEBOOK_APP_ID and FACEBOOK_APP_SECRET, or neither',
    path: ['FACEBOOK_APP_SECRET'],
  });

// An unset or unusable value stops the process here rather than falling back to a default that
// would weaken authentication or the database connection (OWASP API8)
function readEnv(): z.infer<typeof envSchema> {
  const present = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== undefined && value !== ''),
  );

  const parsed = envSchema.safeParse(present);
  if (!parsed.success) {
    const problems = parsed.error.issues.map(
      (issue) => `  ${issue.path.join('.') || 'env'}: ${issue.message}`,
    );
    throw new Error(`[config] The environment is not usable:\n${problems.join('\n')}`);
  }
  return parsed.data;
}

const env = readEnv();

const sslMode = env.DATABASE_SSL ?? (env.DATABASE_URL ? 'verify' : 'off');

// The frontend and the API are served from different sites in production, so a Strict cookie is
// never attached to the refresh call and the session cannot be renewed; None keeps it cross-site
// while Secure and the /api/auth path stop it travelling anywhere else (OWASP API2)
const refreshCookieSameSite = env.REFRESH_COOKIE_SAMESITE ?? (env.ENV === 'production' ? 'none' : 'strict');

const allowedOrigins = env.ALLOWED_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const r2 =
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET
    ? {
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucket: env.R2_BUCKET,
      }
    : null;

export const config = {
  env: env.ENV,
  isProduction: env.ENV === 'production',
  isTest: env.ENV === 'test',
  port: env.PORT,
  allowedOrigins,
  publicUrl: (env.PUBLIC_URL ?? `http://localhost:${env.PORT}`).replace(/\/+$/, ''),
  jsonBodyLimit: env.JSON_BODY_LIMIT,
  trustProxy: env.TRUST_PROXY,
  logLevel: env.LOG_LEVEL ?? (env.ENV === 'test' ? 'silent' : 'info'),
  prettyLogs: env.ENV === 'dev' && env.NODE_ENV !== 'production',

  apiRateLimit: env.API_RATE_LIMIT,
  authRateLimit: env.AUTH_RATE_LIMIT,

  tokenSecret: env.TOKEN_SECRET,
  accessTokenExpiry: env.ACCESS_TOKEN_EXPIRY,
  refreshTokenExpiryMs: env.REFRESH_TOKEN_EXPIRY_DAYS * DAY_MS,

  passwordPepper: env.PASSWORD_PEPPER,
  saltRounds: env.SALT_ROUNDS,

  database: {
    url: env.DATABASE_URL,
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    name: env.ENV === 'test' ? env.POSTGRES_TEST_DB : env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    sslMode,
    sslCa: env.DATABASE_SSL_CA,
  },

  // The browser keeps the refresh token in a cookie JavaScript cannot read, so an XSS bug in the
  // frontend cannot steal a session; it is sent only to the auth routes (OWASP API2)
  refreshCookie: {
    name: 'refreshToken',
    path: '/api/auth',
    sameSite: refreshCookieSameSite,
    httpOnly: true,
    secure: env.ENV === 'production',
    maxAgeMs: env.REFRESH_TOKEN_EXPIRY_DAYS * DAY_MS,
  },

  storage: {
    r2,
    localDir: env.ENV === 'test' ? path.join(os.tmpdir(), 'btc-cargo-test-uploads') : env.UPLOAD_DIR,
    maxBytes: env.UPLOAD_MAX_BYTES,
  },

  social: {
    googleClientId: env.GOOGLE_CLIENT_ID,
    facebookAppId: env.FACEBOOK_APP_ID,
    facebookAppSecret: env.FACEBOOK_APP_SECRET,
    lineChannelId: env.LINE_CHANNEL_ID,
  },

  demo: {
    autoApproveSeconds: env.ENV === 'test' ? 0 : env.DEMO_AUTO_APPROVE_SECONDS,
    loginEnabled: env.DEMO_LOGIN_ENABLED,
    username: env.DEMO_USERNAME,
    password: env.DEMO_PASSWORD,
    email: env.DEMO_EMAIL,
  },
};
