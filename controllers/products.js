import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import checkAdmin from "../middleware/checkAdmin.js";
import uploadPic from "../middleware/uploadPic.js";
import {Product} from "../models/product.js";
import uploadToCloudinary from "../utils/cloudinaryConfig.js";
const router = express.Router();

// ========= Protected Routes =========
router.get("/", verifyToken, async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/:productId", verifyToken, async (req, res) => {
  try {
    const products = await Product.findById(req.params.productId);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Only admin can create products
router.post(
  "/",
  verifyToken,
  checkAdmin,
  uploadPic.single("image"),
  async (req, res) => {
    try {
      
      let image_url = "";

     // 如果上传了图片，使用 Cloudinary 上传图片
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file);
        image_url = uploadResult.secure_url; // 获取 Cloudinary 返回的安全 URL
      } else {
        image_url = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/default.jpg'; // 如果没有上传图片，使用默认图片
      }


      // 将图片 URL 添加到请求体中
      req.body.image_url = image_url;

      // 创建新的产品记录
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

   // Only admin can delete product
   router.delete("/:productId", verifyToken, checkAdmin, async (req, res) => {
     try {
       console.log(111);
       const { productId } = req.params;
       console.log(productId);
       if (!productId) {
         return res.status(400).json({ message: "Invalid product ID" });
       }
       const deletedProduct = await Product.findByIdAndDelete(productId);
       console.log("Deleted Product:", deletedProduct);
       if (!deletedProduct) {
         return res.status(404).json({ message: "Product not found" });
       }
       res.status(200).json({ message: "Product deleted  successfully." });
     } catch (error) {
       console.error("Error deleting product:", error);
       res
         .status(500)
         .json({ message: "Failed to delete product.", error: error.message });
     }
   });

// Only admin can update product
// 更新产品的路由，支持图片上传
router.put(
  "/:productId",
  verifyToken,
  checkAdmin,
  uploadPic.single("image"),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const updatedData = { ...req.body };

      // 如果上传了新图片，则通过 Cloudinary 上传图片
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file);
        updatedData.image_url = uploadResult.secure_url;
      }

     

      // 更新产品信息
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updatedData,
        { new: true } // 返回更新后的产品
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // 返回更新后的产品数据
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Error updating product", error: error.message });
    }
  }
);
export default router;
