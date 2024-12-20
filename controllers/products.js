import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import checkAdmin from "../middleware/checkAdmin.js";
import Product from "../models/product.js";

const router = express.Router();

// ========= Protected Routes =========
router.get("/",verifyToken,async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Only admin can create products
router.post("/", verifyToken,checkAdmin, async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);
    req.body.author = req.user._id;
    const product = await Product.create(req.body);
  
    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

export default router;