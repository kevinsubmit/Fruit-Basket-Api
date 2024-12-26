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
      
      const { image_url, name, description, price } = req.body;

    const finalImageUrl =
      image_url ||
      "https://res.cloudinary.com/your-cloud-name/image/upload/v1/default.jpg";
     

      // 创建新的产品记录
      const product = await Product.create({
        name,
        description,
        price,
        image_url: finalImageUrl,
      });
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
      const { name, description, price, image_url } = req.body;

      // 如果没有传递新的图片 URL，保留现有的图片 URL 或使用默认值
      const finalImageUrl =
        image_url ||
        "https://res.cloudinary.com/your-cloud-name/image/upload/v1/default.jpg";

      

      // 更新产品信息
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { name, description, price, image_url: finalImageUrl },
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

router.post(
  "/upload",
  checkAdmin,
  verifyToken,
  uploadPic.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // 上传图片到 Cloudinary
      const uploadResult = await uploadToCloudinary(req.file);
      res.status(200).json({ image_url: uploadResult.secure_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      res
        .status(500)
        .json({ message: "Failed to upload image", error: error.message });
    }
  }
);

export default router;
