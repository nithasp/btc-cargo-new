import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '../config';

// bcrypt reads only the first 72 bytes of its input, which would drop the pepper of a long
// password; folding both into a fixed-length HMAC first keeps the pepper in play (OWASP password storage)
const peppered = (password: string): string =>
  crypto.createHmac('sha256', config.passwordPepper).update(password, 'utf8').digest('base64');

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(peppered(password), config.saltRounds);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(peppered(password), hash);
}

const DUMMY_HASH = bcrypt.hashSync(peppered('no-such-account'), config.saltRounds);

// An unknown username, or an account with no password (social sign-in only), costs the same as a
// real check, so response time does not tell an attacker which accounts exist (OWASP API2)
export async function spendVerifyTime(): Promise<void> {
  await bcrypt.compare('no-such-account', DUMMY_HASH);
}
