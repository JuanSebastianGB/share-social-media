import type { NextFunction, Request, Response } from 'express';
import s3Upload from '../utilities/s3Upload.js';

/**
 * Patch BEFORE app import: Express stores the handler reference at route
 * registration, so mutating after `import { app }` has no effect.
 */
s3Upload.uploadToS3 = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.file) {
    req.image = {
      secure_url: 'https://media.local/uploads/stub.jpg',
      key: 'uploads/stub.jpg',
    };
  }
  next();
};

const { app } = await import('../app.js');

export { app };
