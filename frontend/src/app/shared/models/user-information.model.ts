export interface ExtendedUser {
  gender?: string;
  line?: string;
  facebook?: string;
  affiliateName?: string;
  birthDate?: string;
  referralCode?: string;
  billingAddressId?: number;
  shippingAddressId?: number;
  has_consent?: boolean;
}

export interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  is_staff: boolean;
  extendeduser: ExtendedUser;
  social: string;
}
