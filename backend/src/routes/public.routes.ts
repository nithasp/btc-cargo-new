import { Router } from 'express';
import helmet from 'helmet';
import { config } from '../config';
import * as reports from '../controllers/reports.controller';
import * as uploads from '../controllers/uploads.controller';
import { verifyAuthToken } from '../middleware/auth';
import { IFRAME_RESIZER_ORIGIN } from '../utils/reportPage';

// A report is shown inside a frame on the frontend, which helmet's default policy forbids; this
// policy lets only the allowed origins frame it and lets the page load nothing but its resizer script
const embedCsp = helmet.contentSecurityPolicy({
  useDefaults: false,
  directives: {
    defaultSrc: ["'none'"],
    scriptSrc: [IFRAME_RESIZER_ORIGIN],
    styleSrc: ["'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    frameAncestors: config.allowedOrigins,
    baseUri: ["'none'"],
  },
});

const router = Router();

router.get('/embed/:type/:token', embedCsp, reports.embed);
router.get('/media/*key', verifyAuthToken, uploads.media);

export default router;
