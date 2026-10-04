import { HtmlContent } from '../types/content.types';
import { PAYMENT_SERVICE } from '../types/masterData.types';
import { MasterDataServiceDeps } from '../types/service.types';
import { notFound } from '../utils/errors';
import { odooDateTime } from '../utils/format';

const API_VERSION = '1.0.0';
export const CONSENT_KEY = 'consent';

export function createMasterDataService({ masterData, contents }: MasterDataServiceDeps) {
  return {
    system() {
      return { system_date: odooDateTime(new Date()), api_version: API_VERSION };
    },

    deliveryTypes: () => masterData.deliveryTypes(),
    productTypes: () => masterData.productTypes(),
    stockPickingTypes: () => masterData.stockPickingTypes(),
    stockLocations: () => masterData.stockLocations(),
    shopTypes: () => masterData.shopTypes(),
    thaiCarriers: () => masterData.thaiCarriers(),
    localDeliveries: () => masterData.localDeliveries(),
    alipayAccounts: () => masterData.alipayAccounts(),

    async currencyStatus(service: string): Promise<{ status: boolean }> {
      const currency = await masterData.currency(service);
      return { status: Boolean(currency?.isOnline) };
    },

    async currencies(service: string) {
      const currency = await masterData.currency(service);
      if (!currency) return [];
      return [
        {
          [PAYMENT_SERVICE]: {
            name: currency.name,
            is_online: currency.isOnline,
            rate: currency.rate,
            created_at: odooDateTime(currency.createdAt),
            modified_at: odooDateTime(currency.modifiedAt),
          },
        },
      ];
    },

    async htmlContent(key: string): Promise<HtmlContent> {
      const content = await contents.findByKey(key);
      if (!content) throw notFound('Content');
      return content;
    },
  };
}

export type MasterDataService = ReturnType<typeof createMasterDataService>;
