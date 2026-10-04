import { Router } from 'express';
import accountRoutes from './account.routes';
import authRoutes from './auth.routes';
import odooRoutes from './odoo';

const api = Router();

api.use(authRoutes);
api.use('/odoo', odooRoutes);
api.use(accountRoutes);

export default api;
