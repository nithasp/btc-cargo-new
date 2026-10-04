import { config } from '../../config';
import { logger } from '../../logger';
import { StorageDriver } from '../../types/upload.types';
import { createLocalStorage } from './local.storage';
import { createR2Storage } from './r2.storage';

export function createStorage(): StorageDriver {
  if (config.storage.r2) return createR2Storage(config.storage.r2);

  if (config.isProduction) {
    logger.warn(
      'R2 is not configured: uploads go to local disk and may be lost when the server is redeployed',
    );
  }
  return createLocalStorage(config.storage.localDir);
}
