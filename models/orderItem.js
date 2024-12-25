import mongoose from "mongoose";
const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  isDeleted: {
    // 新增字段，用于标记商品是否被删除
    type: Boolean,
    default: false,
  },
});

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
