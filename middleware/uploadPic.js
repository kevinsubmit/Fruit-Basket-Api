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

export default uploadPic;
