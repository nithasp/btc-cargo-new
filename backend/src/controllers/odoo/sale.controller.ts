import { Request, Response } from 'express';
import { discountSchema } from '../../schemas/affiliate.schema';
import { pageSchema } from '../../schemas/common.schema';
import { quotationSchema } from '../../schemas/sale.schema';
import {
  checkTrackingSchema,
  registerTrackingSchema,
  toConfirmSubmitSchema,
  trackingQuerySchema,
  updateTrackingSchema,
} from '../../schemas/tracking.schema';
import { saleService, trackingService } from '../../services';
import { asyncHandler } from '../../utils/asyncHandler';
import { currentUserId } from '../../utils/request';
import { sendOk } from '../../utils/response';
import { parse } from '../../utils/validation';

export const registerTracking = asyncHandler(async (req: Request, res: Response) => {
  const input = parse(registerTrackingSchema, req.body);
  sendOk(res, await trackingService.register(currentUserId(req), input), 'Parcels registered', 201);
});

export const updateTracking = asyncHandler(async (req: Request, res: Response) => {
  const input = parse(updateTrackingSchema, req.body);
  await trackingService.update(currentUserId(req), input);
  sendOk(res, null, 'Parcels updated');
});

export const checkTracking = asyncHandler(async (req: Request, res: Response) => {
  const { serial_list } = parse(checkTrackingSchema, req.body);
  sendOk(res, { exist: await trackingService.exists(serial_list) });
});

export const trackingDetails = asyncHandler(async (req: Request, res: Response) => {
  const page = parse(pageSchema, req.query);
  const { is_ready } = parse(trackingQuerySchema, req.query);
  sendOk(res, await trackingService.listDetails(currentUserId(req), is_ready === true, page));
});

export const trackingList = asyncHandler(async (req: Request, res: Response) => {
  const page = parse(pageSchema, req.query);
  sendOk(res, await trackingService.list(currentUserId(req), page));
});

export const toConfirm = asyncHandler(async (req: Request, res: Response) => {
  const page = parse(pageSchema, req.query);
  sendOk(res, await trackingService.listToConfirm(currentUserId(req), page));
});

export const submitToConfirm = asyncHandler(async (req: Request, res: Response) => {
  const { lot_id, po_image } = parse(toConfirmSubmitSchema, req.body);
  await trackingService.submitToConfirm(currentUserId(req), lot_id, po_image);
  sendOk(res, null, 'Proof of purchase submitted');
});

export const quotation = asyncHandler(async (req: Request, res: Response) => {
  const input = parse(quotationSchema, req.body);
  sendOk(res, await saleService.createQuotation(currentUserId(req), input), 'Bill created', 201);
});

export const summary = asyncHandler(async (req: Request, res: Response) => {
  const page = parse(pageSchema, req.query);
  sendOk(res, await saleService.summary(currentUserId(req), page));
});

export const discount = asyncHandler(async (req: Request, res: Response) => {
  const { sale_order_id, discount_amount } = parse(discountSchema, req.body);
  await saleService.setDiscount(currentUserId(req), sale_order_id, discount_amount);
  sendOk(res, null, 'Discount saved');
});
