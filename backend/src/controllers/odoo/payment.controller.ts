import { Request, Response } from 'express';
import { idParams, pageSchema } from '../../schemas/common.schema';
import { exchangeSchema, paymentSchema, serviceQuerySchema } from '../../schemas/payment.schema';
import { paymentGatewayService } from '../../services';
import { asyncHandler } from '../../utils/asyncHandler';
import { currentUserId } from '../../utils/request';
import { sendOk } from '../../utils/response';
import { parse } from '../../utils/validation';

export const index = asyncHandler(async (req: Request, res: Response) => {
  const page = parse(pageSchema, req.query);
  const { service } = parse(serviceQuerySchema, req.query);
  sendOk(res, await paymentGatewayService.list(currentUserId(req), service, page));
});

// The payment page tells "no such bill" apart from a failure by a 200 whose `data` is null
export const show = asyncHandler(async (req: Request, res: Response) => {
  const params = idParams.safeParse(req.params);
  const bill = params.success ? await paymentGatewayService.find(currentUserId(req), params.data.id) : null;

  if (!bill) {
    res.json({ success: false, message: 'Bill not found', data: null });
    return;
  }
  sendOk(res, bill);
});

export const createExchange = asyncHandler(async (req: Request, res: Response) => {
  const input = parse(exchangeSchema, req.body);
  sendOk(res, await paymentGatewayService.createExchange(currentUserId(req), input), 'Exchange created', 201);
});

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const input = parse(paymentSchema, req.body);
  sendOk(res, await paymentGatewayService.createPayment(currentUserId(req), input), 'Payment reported', 201);
});
