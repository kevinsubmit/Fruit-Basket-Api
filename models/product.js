import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
  user_id: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  product_id: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
  },
  text: {
    type: String,
    required: true,
  },
  
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reviews: [reviewSchema]
});


const Product = mongoose.model("Product", userSchema);
export default Product;