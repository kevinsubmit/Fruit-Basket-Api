import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import Order from "../models/order.js";
import { Product } from "../models/product.js";
import OrderItem from "../models/orderItem.js";
const router = express.Router();

// ========= Protected Routes =========

router.get("/", verifyToken, async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role === "admin") {
      const orders = await Order.find({});
      return res.status(200).json(orders);
    }

    const orders = await Order.find({ user_id: _id });
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

export default router;
