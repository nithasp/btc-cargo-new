import { Request, Response } from 'express';
import { addressUpdateSchema, newAddressSchema } from '../schemas/address.schema';
import { idParams } from '../schemas/common.schema';
import { addressService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';
import { currentUserId } from '../utils/request';
import { parse, parseFields } from '../utils/validation';

export const index = asyncHandler(async (req: Request, res: Response) => {
  res.json(await addressService.listForUser(currentUserId(req)));
});

export const show = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parse(idParams, req.params);
  res.json(await addressService.getForUser(id, currentUserId(req)));
});

// The owner comes from the token; a "user" id sent in the body is ignored (OWASP API1)
export const create = asyncHandler(async (req: Request, res: Response) => {
  const form = parseFields(newAddressSchema, req.body);
  res.status(201).json(await addressService.createForUser(currentUserId(req), form));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parse(idParams, req.params);
  const changes = parseFields(addressUpdateSchema, req.body);
  res.json(await addressService.updateForUser(id, currentUserId(req), changes));
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parse(idParams, req.params);
  await addressService.deleteForUser(id, currentUserId(req));
  res.status(204).end();
});
