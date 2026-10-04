import { z } from 'zod';

const REQUIRED = 'This field is required.';
const BLANK = 'This field may not be blank.';

export const MIN_PASSWORD_LENGTH = 8;

// The register page decides which Thai message to show by looking for the words "valid", "exists",
// "short", "common" and "numeric" inside these strings, so their wording is part of the API contract.
export const INVALID_USERNAME =
  'Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.';
export const USERNAME_TAKEN = 'A user with that username already exists.';
export const INVALID_EMAIL = 'Enter a valid email address.';
export const EMAIL_TAKEN = 'A user is already registered with this e-mail address.';
export const PASSWORD_TOO_SHORT = `This password is too short. It must contain at least ${MIN_PASSWORD_LENGTH} characters.`;
export const PASSWORD_TOO_COMMON = 'This password is too common.';
export const PASSWORD_NUMERIC = 'This password is entirely numeric.';
export const PASSWORD_TOO_SIMILAR = 'The password is too similar to the username.';
export const PASSWORD_MISMATCH = "The two password fields didn't match.";
export const INVALID_LOGIN = 'Unable to log in with provided credentials.';

const USERNAME_PATTERN = /^[\w.@+-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_SIMILARITY_LENGTH = 4;

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  'passw0rd',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'qwertyuiop',
  '1q2w3e4r',
  '1qaz2wsx',
  'abc12345',
  'abcd1234',
  'iloveyou',
  'admin123',
  'welcome1',
  'letmein1',
  '11111111',
  '00000000',
  'aa123456',
]);

const field = (max: number) =>
  z.string(REQUIRED).min(1, BLANK).max(max, `Ensure this field has no more than ${max} characters.`);

export const loginSchema = z.object({
  username: field(150),
  password: field(128),
});

export const registrationSchema = z.object({
  username: field(150),
  email: field(254),
  password1: field(128),
  password2: field(128),
  extendeduser: z
    .object({ referralCode: z.union([z.string().trim().max(50), z.null()]).optional() })
    .optional(),
});

export const socialLoginSchema = z.object({
  access_token: z.string(REQUIRED).min(1, BLANK).max(4096),
  id_token: z.union([z.string().max(8192), z.null()]).optional(),
});

export const isValidUsername = (username: string): boolean => USERNAME_PATTERN.test(username);

export const isValidEmail = (email: string): boolean => EMAIL_PATTERN.test(email);

export function passwordProblems(password: string): string[] {
  const problems: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) problems.push(PASSWORD_TOO_SHORT);
  if (COMMON_PASSWORDS.has(password.toLowerCase())) problems.push(PASSWORD_TOO_COMMON);
  if (/^\d+$/.test(password)) problems.push(PASSWORD_NUMERIC);
  return problems;
}

export function isTooSimilar(password: string, username: string): boolean {
  const pass = password.toLowerCase();
  const name = username.toLowerCase();
  if (name.length < MIN_SIMILARITY_LENGTH) return pass === name;
  return pass.includes(name) || name.includes(pass);
}

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;
