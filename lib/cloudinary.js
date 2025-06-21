import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const uploadAudio = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // Audio is treated as video in Cloudinary
        format: "ogg",
        folder: "whatsapp-audio",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export const deleteOldAudio = async (publicId) => {
  setTimeout(async () => {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
};
