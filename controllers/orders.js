import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import checkAdmin from "../middleware/checkAdmin.js";
import Order from "../models/order.js";
import { Product } from "../models/product.js";
import OrderItem from "../models/orderItem.js";
const router = express.Router();

// ========= Protected Routes =========

router.get("/", verifyToken, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role === "admin") {
      const orders = await Order.find({}).populate({
        path: "orderItems_id",
        populate: { path: "product_id", model: "Product" },
      });
      return res.status(200).json(orders);
    }

    const orders = await Order.find({ user_id: _id }).populate({
      path: "orderItems_id",
      populate: { path: "product_id", model: "Product" },
    });
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve orders", error: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { _id } = req.user;
    const { user_id, orderItems } = req.body;
    if (user_id.toString() !== _id.toString()) {
      return res.status(403).json({
        message: "Forbidden: You can only create orders for yourself.",
      });
    }

    const orderItemsIds = [];

    for (const item of orderItems) {
      const { product_id, quantity, purchasePrice } = item;
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({
          message: "this product is not found",
        });
      }

      // create OrderItem
      const orderItem = await OrderItem.create({
        product_id,
        quantity,
        purchasePrice,
      });
      orderItemsIds.push(orderItem._id);
    }
    // create Order
    const order = await Order.create({
      user_id,
      status: "paid",
      orderItems_id: orderItemsIds,
    });
    res.status(201).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});


// order.js (后端路由)
router.post("/orders/update", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    // 查找所有包含该商品的订单
    const orders = await Order.find({
      "orderItems_id.product_id": productId,
    }).populate("orderItems_id.product_id");

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this product." });
    }

    // 更新订单中的商品项，软删除商品
    for (const order of orders) {
      let updated = false;
      for (const item of order.orderItems_id) {
        if (item.product_id && item.product_id._id.toString() === productId) {
          item.isDeleted = true; // 软删除商品项
          updated = true;
        }
      }

      if (updated) {
        await order.save();
      }
    }

    res.status(200).json({ message: "Orders updated with deleted product." });
  } catch (error) {
    console.error("Error updating orders with deleted product:", error);
    res.status(500).json({ message: "Failed to update orders with deleted product.", error: error.message });
  }
});





export default router;
