import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import checkAdmin from "../middleware/checkAdmin.js";
import { Product } from "../models/product.js";
const router = express.Router();
// ========= Protected Routes =========
router.get("/", verifyToken, async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false });
    if (products.length === 0) {
      return res.status(404).json({ message: "No active products found" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products"});
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
router.post("/", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { name, price, image_url } = req.body;
    if (
      !name ||
      !image_url ||
      !price ||
      typeof price !== "number" ||
      price <= 0
    ) {
      return res.status(400).json({
        message: "Product name, image url,price or valid price is wrong",
      });
    }
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error.message || error);
    return res.status(500).json({
      message:
        "An error occurred while creating the product. Please try again.",
    });
  }
});

// Only admin can update product
router.put("/:productId", verifyToken, checkAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    //  只允许更新特定字段，防止意外修改不应该修改的字段
    const allowedUpdates = ["name", "price", "description", "image_url", "isDeleted"];
    const filteredUpdateData = {};

    for (let key in updateData) {
      if (allowedUpdates.includes(key)) {
        filteredUpdateData[key] = updateData[key];
      }
    }

    // 如果没有允许的字段需要更新
    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({ message: "Invalid fields for update" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      filteredUpdateData,
      { new: true, runValidators: true } 
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    // 5. 返回更新后的产品
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error.message);
    return res.status(500).json({ message: "Error updating product", error: error.message });
  }
});


// Only admin can delete product
router.delete("/:productId", verifyToken, checkAdmin, async (req, res) => {
  const { productId } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndUpdate(
      productId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product soft deleted successfully.",
    });
  } catch (error) {
    console.error("Error soft deleting product:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete product.", error: error.message });
  }
});

export default router;
