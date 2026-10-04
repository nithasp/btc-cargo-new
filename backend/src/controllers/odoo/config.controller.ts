import { Request, Response } from 'express';
import { serviceQuerySchema } from '../../schemas/payment.schema';
import { masterDataService } from '../../services';
import { PAYMENT_SERVICE } from '../../types/masterData.types';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendOk } from '../../utils/response';
import { parse } from '../../utils/validation';

const list = <T>(load: () => Promise<T>) =>
  asyncHandler(async (_req: Request, res: Response) => {
    sendOk(res, await load());
  });

export const system = asyncHandler(async (_req: Request, res: Response) => {
  sendOk(res, masterDataService.system());
});

export const productTypes = list(masterDataService.productTypes);
export const stockPickingTypes = list(masterDataService.stockPickingTypes);
export const stockLocations = list(masterDataService.stockLocations);
export const shopTypes = list(masterDataService.shopTypes);
export const thaiCarriers = list(masterDataService.thaiCarriers);
export const deliveryTypes = list(masterDataService.deliveryTypes);
export const localDeliveries = list(masterDataService.localDeliveries);
export const alipayAccounts = list(masterDataService.alipayAccounts);

export const currencyStatus = asyncHandler(async (req: Request, res: Response) => {
  const { service } = parse(serviceQuerySchema, req.query);
  sendOk(res, await masterDataService.currencyStatus(service ?? PAYMENT_SERVICE));
});

export const currencies = asyncHandler(async (req: Request, res: Response) => {
  const { service } = parse(serviceQuerySchema, req.query);
  sendOk(res, await masterDataService.currencies(service ?? PAYMENT_SERVICE));
});
