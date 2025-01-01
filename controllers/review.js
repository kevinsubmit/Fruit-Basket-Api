import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { Product, Review } from "../models/product.js";
import OrderItem from "../models/orderItem.js";
import Order from "../models/order.js";
const router = express.Router();

// ========= Protected Routes =========
router.get("/:productId", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate(
     "reviews.user_id",
      "username",
    );
    if (!product) {
      return res.status(404).json({ message: "The product not found" });
    }

    const { _id, role } = req.user;
    const reviews = product.reviews.map((review) => {
      // 判断是否有权限操作评论
      let isOperate = false;

      // 如果是管理员，则可以操作所有评论
      if (role === "admin") {
        isOperate = true;
      }

      // 如果是普通用户，且该评论属于该用户
      if (review.user_id.toString() === _id.toString()) {
        isOperate = true;
      }

      // 给每个评论添加 isOperate 属性
      return {
        ...review.toObject(), // 保证评论的其他属性被保留
        isOperate,
        username:review.user_id.username,
      };
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving product reviews",
      error: error.message,
    });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { product_id, user_id } = req.body;
    const { _id,username} = req.user;

    // 1. 验证用户身份：确保请求中的 userId 和当前用户一致
    if (String(user_id) !== String(_id)) {
      return res.status(403).json({
        message: "Forbidden: You can only create reviews for yourself",
      });
    }
    
    // 2. 检查产品是否存在
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. 查找包含该产品的 OrderItem
    const orderItem = await OrderItem.findOne({
      product_id: product_id, // 产品 ID
    });

    // 如果没有找到订单项，说明用户没有购买过该产品
    if (!orderItem) {
      return res.status(403).json({
        message: "You  have not purchased this product.",
      });
    }

    // 4. 查找用户的订单，并确保该订单的 status 为 'paid'，并且订单中包含对应的 orderItem
    const order = await Order.findOne({
      user_id: _id, // 当前用户
      status: "paid", // 确保订单的状态为 "paid"
    });
    if (!order) {
      return res.status(403).json({
        message:
          "You must have purchased this product and the order must be paid to leave a review.",
      });
    }

    // 5. 创建评论
    const review = await Review.create(req.body);
   

    // 6. 将评论添加到产品的 reviews 数组中
    product.reviews.push(review);
    await product.save();
    const reviewData = {
      ...review.toObject(),username
    }
    // 7. 返回评论
    res.status(201).json(reviewData);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating review", error: error.message });
  }
});

router.put("/:reviewId", verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { _id } = req.user;

    // 1. 查找评论
    const review = await Review.findById(reviewId).populate(
      "product_id user_id"
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // 2. 检查用户是否是评论的作者或管理员
    if (
      review.user_id._id.toString() !== _id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Forbidden: You can only modify your own reviews or you need to be an admin.",
      });
    }

    // 3. 更新评论内容

    review.text = req.body.text || review.text;
    await review.save();

    // 4. 确保 Product 模型的 reviews 数组保持最新
    const product = await Product.findById(review.product_id);

    // 找到旧评论的索引
    const reviewIndex = product.reviews.findIndex(
      (r) => r.toString() === reviewId
    );
    if (reviewIndex !== -1) {
      // 更新评论内容
      product.reviews[reviewIndex] = review._id;
      await product.save();
    }

    res.status(200).json(review);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error updating review", error: error.message });
  }
});

router.delete("/:reviewId", verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { _id } = req.user;

    // 1. 查找评论
    const review = await Review.findById(reviewId).populate(
      "product_id user_id"
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // 2. 检查用户是否是评论的作者或管理员
    if (
      review.user_id._id.toString() !== _id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Forbidden: You can only delete your own reviews or you need to be an admin.",
      });
    }

    // 3. 删除评论
    await Review.deleteOne({ _id: reviewId });

    // 4. 从产品的 reviews 数组中删除该评论
    const product = await Product.findById(review.product_id);

    // 从 reviews 数组中移除评论
    product.reviews.pull(reviewId);
    await product.save();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error deleting review", error: error.message });
  }
});

export default router;
