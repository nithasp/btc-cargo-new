import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { optionalAuthToken, trustedOrigin, verifyAuthToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/login', authLimiter, auth.login);
router.post('/registration', authLimiter, auth.register);

router.post('/auth/google', authLimiter, optionalAuthToken, auth.social('google'));
router.post('/auth/facebook', authLimiter, optionalAuthToken, auth.social('facebook'));
router.post('/auth/line', authLimiter, optionalAuthToken, auth.social('line'));

// It asks for no credentials, so without the origin check a page on another site could swap a
// visitor's own session for the demo one (login CSRF)
router.post('/auth/demo', authLimiter, trustedOrigin, auth.demo);

router.post('/auth/refresh', authLimiter, trustedOrigin, auth.refresh);
router.post('/auth/logout', trustedOrigin, auth.logout);
router.post('/auth/logout-all', verifyAuthToken, auth.logoutAll);

export default router;
