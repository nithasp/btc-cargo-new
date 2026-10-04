export const PRICE_KEYS = ['p', 'd', 'hy', 'm', 'sp', 'sd'] as const;

export type PriceKey = (typeof PRICE_KEYS)[number];

export type PriceMap = Record<PriceKey, number>;

export interface PriceSet {
  id: number;
  weight_price: PriceMap;
  volume_price: PriceMap;
}

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

export interface AffiliateTeam {
  id: number;
  ownerUserId: number;
  btcCode: string;
  commissionRate: number;
  monthlyGoal: number;
  costing: PriceSet;
  selling: PriceSet;
}

export interface MemberData {
  affiliateCode: string;
  name: string;
  email: string;
  commissionType: string;
  referralCode: string;
  commissionRate: number;
  btcCode: string;
  vat: string;
  phoneNumber: string;
  line1: string;
  line2: string;
}

export interface AffiliateMember {
  id: number;
  name: string;
  affiliate_code: string;
  commission_type: string;
  referral_code: string;
  commission_rate: number;
  btc_code: string;
  email: string;
  vat: string;
  affiliate_address: {
    phone_number: string;
    line1: string;
    line2: string;
    display_name: string;
  };
  selling_id: PriceSet;
  costing_id: PriceSet;
}

export interface MemberAttribution {
  memberId: number;
  teamId: number;
  commissionRate: number;
  costPrice: number;
  sellingPrice: number;
}

export interface TeamView {
  team_setting: {
    id: number;
    btc_code: string;
    commission_rate: number;
    selling_id: PriceSet;
    costing_id: PriceSet;
  };
  team_members: AffiliateMember[];
}
