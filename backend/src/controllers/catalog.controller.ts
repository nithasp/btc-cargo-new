import { Request, Response } from 'express';
import { z } from 'zod';
import { cartSchema } from '../schemas/cart.schema';
import { idParams, requiredText } from '../schemas/common.schema';
import { catalogService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';
import { currentUserId } from '../utils/request';
import { parse, parseFields } from '../utils/validation';

const importSchema = z.object({ url: requiredText(2000) });

export const cart = asyncHandler(async (req: Request, res: Response) => {
  res.json(await catalogService.getCart(currentUserId(req)));
});

export const createCart = asyncHandler(async (req: Request, res: Response) => {
  const { json } = parseFields(cartSchema, req.body);
  res.status(201).json(await catalogService.saveCart(currentUserId(req), json));
});

export const updateCart = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parse(idParams, req.params);
  const { json } = parseFields(cartSchema, req.body);
  res.json(await catalogService.updateCart(id, currentUserId(req), json));
});

export const products = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await catalogService.listProducts());
});

export const cartTestProducts = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await catalogService.listCartTestProducts());
});

export const importProduct = asyncHandler(async (req: Request, res: Response) => {
  const { url } = parse(importSchema, req.body);
  res.json(catalogService.importProduct(url));
});
