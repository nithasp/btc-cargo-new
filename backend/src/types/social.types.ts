export const SOCIAL_PROVIDERS = ['google', 'facebook', 'line'] as const;

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export interface SocialLink {
  uid: string;
  extra_data: Record<string, unknown>;
}

export interface SocialAccount {
  id: number;
  userId: number;
  provider: SocialProvider;
  uid: string;
  extraData: Record<string, unknown>;
}

export interface SocialProfile {
  uid: string;
  email: string | null;
  name: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  extraData: Record<string, unknown>;
}
