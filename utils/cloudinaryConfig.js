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
      { resource_type: "auto" }, // 自动处理文件类型（图片、视频等）
      (error, result) => {
        if (error) {
          reject(error); // 上传失败时返回错误
        } else {
          resolve(result); // 上传成功时返回结果
        }
      }
    );

    // 创建可读流，将文件数据传输到 Cloudinary 上传流
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer); // 上传文件的数据
    bufferStream.pipe(uploadStream); // 将文件流传给 Cloudinary 上传流
  });
};

export default uploadToCloudinary;
