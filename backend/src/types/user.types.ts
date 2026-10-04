import { SocialLink, SocialProvider } from './social.types';

export const USER_ROLES = ['customer', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

// Never sent to a client: it carries the password hash
export interface StoredUser extends AuthUser {
  passwordHash: string | null;
}

export interface NewUserRow {
  username: string;
  email: string | null;
  passwordHash: string | null;
  firstName?: string | undefined;
  lastName?: string | undefined;
  referralCode?: string | null | undefined;
}

export interface ExtendedUser {
  gender: string | null;
  telephone: string | null;
  line: string | null;
  facebook: string | null;
  google: string | null;
  affiliateName: string | null;
  birthDate: string | null;
  referralCode: string | null;
  billingAddressId: number | null;
  shippingAddressId: number | null;
  has_consent: boolean;
  line_notify: boolean;
}

export interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  extendeduser: ExtendedUser;
  socials: Record<SocialProvider, SocialLink | null>;
}

export interface UserUpdate {
  firstName?: string | undefined;
  lastName?: string | undefined;
  gender?: string | null | undefined;
  telephone?: string | null | undefined;
  line?: string | null | undefined;
  facebook?: string | null | undefined;
  google?: string | null | undefined;
  affiliateName?: string | null | undefined;
  birthDate?: string | null | undefined;
  billingAddressId?: number | null | undefined;
  shippingAddressId?: number | null | undefined;
  hasConsent?: boolean | undefined;
}
