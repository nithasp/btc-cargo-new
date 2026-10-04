export interface AffiliateMe {
  type: string;
  verification_state: string;
  team_id: number;
}

export interface AffiliateTeam {
  team_setting: {
    id?: number;
    btc_code: string;
    commission_rate: number;
    selling_id: PriceInformations;
    costing_id: PriceInformations;
  };
  team_members: AffiliateMember[];
}

export interface AffiliateMember {
  id?: number;
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
  selling_id: PriceInformations;
  costing_id: PriceInformations;
}

export interface PriceInformations {
  id?: number;
  weight_price: {
    p: number;
    d: number;
    hy: number;
    m: number;
    sp: number;
    sd: number;
  };
  volume_price: {
    p: number;
    d: number;
    hy: number;
    m: number;
    sp: number;
    sd: number;
  };
}

export interface AffiliateModal {
  verificationState: boolean;
  teamData: AffiliateTeam;
}

export enum ReRenderSelectAddressComponentMethod {
  Clear = "clear",
  Update = "update",
}
