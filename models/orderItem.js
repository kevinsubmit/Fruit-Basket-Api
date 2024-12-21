import mongoose from "mongoose";
const orderItemSchema = new mongoose.Schema(
  {
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
  },
);

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
