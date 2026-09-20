import multer from 'multer';

/**
 * memoryStorage keeps uploads in-process (Lambda-friendly).
 * Controllers/S3 upload read buffer + a synthetic filename.
 */
const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    const extension = file.originalname.split('.').pop() || 'bin';
    // Attach a stable filename used by downstream services
    (file as Express.Multer.File & { filename?: string }).filename =
      `file-${Date.now()}.${extension}`;
    callback(null, true);
  },
});

export default uploadMiddleware;
