import { Address, AddressUpdate, NewAddress } from '../types/address.types';
import { AddressServiceDeps } from '../types/service.types';
import { notFound } from '../utils/errors';

export function createAddressService({ addresses }: AddressServiceDeps) {
  return {
    listForUser(userId: number): Promise<Address[]> {
      return addresses.listByUser(userId);
    },

    async getForUser(id: number, userId: number): Promise<Address> {
      const address = await addresses.findForUser(id, userId);
      if (!address) throw notFound('Address');
      return address;
    },

    createForUser(userId: number, form: NewAddress): Promise<Address> {
      return addresses.create(userId, form);
    },

    async updateForUser(id: number, userId: number, changes: AddressUpdate): Promise<Address> {
      const updated = await addresses.update(id, userId, changes);
      if (!updated) throw notFound('Address');
      return updated;
    },

    async deleteForUser(id: number, userId: number): Promise<void> {
      if (!(await addresses.delete(id, userId))) throw notFound('Address');
    },
  };
}

export type AddressService = ReturnType<typeof createAddressService>;
