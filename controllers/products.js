import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import checkAdmin from "../middleware/checkAdmin.js";
import uploadPic from "../middleware/uploadPic.js";
import {Product} from "../models/product.js";
import Order from "../models/order.js";
import cloudinary from 'cloudinary';
import fs from "fs";
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
// 上传和保存产品信息路由
router.post(
  "/",
  verifyToken,  // 验证用户的 token
  checkAdmin,   // 检查是否是管理员
  uploadPic.single("image"),  // 处理上传的单个文件
  async (req, res) => {
    try {
      let image_url = null;
      // 如果上传了图片，将图片上传到 Cloudinary
      if (req.file) {
        // 将图片上传到 Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        // 获取 Cloudinary 返回的图片 URL
        image_url = result.secure_url;
        // 删除上传到服务器的临时文件
        await fs. promises.unlink(req.file.path); 
      } else {
        // 如果没有上传图片，设置默认图片 URL
        image_url = "https://images.app.goo.gl/zqRC2HVoM5uXEq3J8";
      }
      // 将图片 URL 保存在 req.body 中
      req.body.image_url = image_url;
      // 将其他表单数据与图片信息一起保存到数据库
      const product = await Product.create(req.body);
      // 返回创建的产品数据
      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);
// Only admin can delete product
router.delete("/:productId", verifyToken, checkAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(
      req.params.productId
    );
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    // 2. 更新订单中的相关商品项
    const orders = await Order.find({
      "orderItems_id.product_id": productId,
    }).populate("orderItems_id.product_id");
    for (const order of orders) {
      let updated = false;
      for (const item of order.orderItems_id) {
        if (
          item.product_id &&
          item.product_id._id.toString() === req.params.productId
        ) {
          item.isDeleted = true; // 软删除商品项
          updated = true;
        }
      }
      if (updated) {
        await order.save();
      }
    }
    res
      .status(200)
      .json({ message: "Product deleted and orders updated successfully." });
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
      // 如果上传了新图片，则更新 image_url 字段
      if (req.file) {
        updatedData.image_url = `/uploads/${req.file.filename}`; // 设置图片的路径
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updatedData,
        { new: true }
      );
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
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