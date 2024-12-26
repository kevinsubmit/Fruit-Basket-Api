import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import checkAdmin from "../middleware/checkAdmin.js";
import uploadPic from "../middleware/uploadPic.js";
import {Product} from "../models/product.js";
import Order from "../models/order.js";

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
      // 将图片的相对路径保存在 image_url 字段中 keep the picture path in the image_url filed
      // const image_url = req.file ? `/uploads/${req.file.filename}` : "https://images.app.goo.gl/zqRC2HVoM5uXEq3J8"; // 如果上传了图片，保存相对路径
      const image_url = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : `${req.protocol}://${req.get("host")}/uploads/default.jpg`;
      req.body.image_url = image_url;
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
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
