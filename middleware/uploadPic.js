
import dotenv from 'dotenv';
dotenv.config();
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 设置 multer 存储配置（本地文件系统上传，Cloudinary 用法不需要）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // 本地存储文件的目录
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 文件名设置为时间戳 + 扩展名
  }

import multer from "multer";
import path from "path";

// 设置 multer 存储在内存中
const storage = multer.memoryStorage();

// 创建 multer 中间件
const uploadPic = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 限制文件大小为 10MB
  fileFilter: (req, file, cb) => {
    // 只允许上传图片和视频文件
    const allowedMimeTypes = ["image/", "video/"];

    // 如果文件的 mimetype 以 image/ 或 video/ 开头，则允许
    if (!allowedMimeTypes.some((type) => file.mimetype.startsWith(type))) {
      return cb(new Error("Only image and video files are allowed!"), false);
    }

    cb(null, true);
  },

});
const uploadPic = multer({ storage: storage });

export default uploadPic;
