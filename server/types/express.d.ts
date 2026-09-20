import type { JwtUserData } from './auth.js';
import type { UploadedImage } from '../utilities/s3Upload.js';

declare global {
  namespace Express {
    interface Request {
      userData?: JwtUserData;
      image?: UploadedImage;
    }
  }
}

export {};
