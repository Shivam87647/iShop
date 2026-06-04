import cloudinary, { isCloudinaryEnabled } from '../config/cloudinary.js';
import { badRequest } from '../utils/AppError.js';

export const uploadImage = async (fileBuffer, folder = 'ishop/products') => {
  if (!isCloudinaryEnabled()) {
    throw badRequest(
      'Cloudinary is not configured. Set CLOUDINARY_* env vars or provide image URLs directly.'
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    stream.end(fileBuffer);
  });
};

export const deleteImage = async (publicId) => {
  if (!isCloudinaryEnabled() || !publicId) return;
  await cloudinary.uploader.destroy(publicId);
};
