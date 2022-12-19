import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const destiny = `${__dirname}/../storage`;
const options = {
  destination: (req, file, callback) => callback(null, destiny),
  filename: (req, file, callback) => {
    const extension = file.originalname.split('.').pop();
    const filename = `file-${Date.now()}.${extension}`;
    callback(null, filename);
  },
};

const storage = multer.diskStorage(options);
const uploadMiddleware = multer({ storage });

export default uploadMiddleware;
