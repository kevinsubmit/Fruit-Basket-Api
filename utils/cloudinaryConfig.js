// cloudinaryConfig.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import stream from "stream";


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // 自动识别文件类型（图片、视频等）
        public_id: file.originalname, // 使用原始文件名作为 public_id（可选）
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result); // 返回上传后的结果（包括 secure_url）
      }
    );

    // 直接将文件的 buffer 传递给 upload_stream
    uploadStream.end(file.buffer); // 结束并上传文件
  });
};


export default uploadToCloudinary;
