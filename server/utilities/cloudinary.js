import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

export const configCloudinary = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudUpload = cloudinary.v2;

const cloud = {
  uploadToCloud(req, res, next) {
    const { path } = req.file;
    cloudUpload.uploader
      .upload(path, {
        tags: 'profilePicture',
        // width: 150,
        // height: 150,
        crop: 'pad',
      })
      .then((image) => {
        req.image = image;
        return next();
      });
  },
};

export default cloud;
