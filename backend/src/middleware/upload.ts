import multer from 'multer';
import { config } from '../config';

// Held in memory so the bytes can be type-checked before anything is written to storage; the size
// cap keeps a single request from exhausting it (OWASP API4)
export const singleFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.storage.maxBytes, files: 1, fields: 10 },
  defParamCharset: 'utf8',
}).single('file');
