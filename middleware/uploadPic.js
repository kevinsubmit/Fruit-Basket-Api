import multer from 'multer';
import path from 'path';

// 设置存储方式，保存文件到磁盘
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // 存储路径为 uploads 文件夹
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 使用当前时间戳作为文件名，避免文件名重复
  }
});

const uploadPic = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 限制图片大小，最大为 10MB
  fileFilter: (req, file, cb) => {
    // 只允许上传图片文件
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

export default uploadPic;
