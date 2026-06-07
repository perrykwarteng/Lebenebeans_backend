import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (filePath: string) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "lebene-foods",
  });
};

export const deleteFromCloudinary = async (public_id: string) => {
  return await cloudinary.uploader.destroy(public_id);
};
