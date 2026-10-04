export type VerificationKind = 'partner' | 'affiliate';

export type VerificationState = 'unverified' | 'reviewing' | 'verified';

export interface Verification {
  id: number;
  userId: number;
  kind: VerificationKind;
  state: 'reviewing' | 'verified' | 'rejected';
  createdAt: Date;
}

export interface VerificationImage {
  id: number;
  url: string;
  image_category: string;
}

export interface CreatedVerification {
  id: number;
  state: VerificationState;
  partner: { id: number; name: string };
  images: VerificationImage[];
}
