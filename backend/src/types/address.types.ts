import { PartialUpdate } from './common.types';

export interface Address {
  id: number;
  name: string;
  person: string;
  telephone: string;
  is_juristic: boolean;
  vat: string;
  address: string;
  district: string;
  user: number;
}

export type NewAddress = Omit<Address, 'id' | 'user'>;

export type AddressUpdate = PartialUpdate<NewAddress>;
