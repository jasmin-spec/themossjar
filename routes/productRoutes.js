const express = require("express");
const Product = require("../models/Product");
const upload = require("../middleware/upload");
const { cloudinary, uploadToCloudinary } = require("../utils/cloudinary");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// GET all products (anyone can see)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one product (anyone can see)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD product (admin only)
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
        const { name, description, price, stock, customisable } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: "Name, description and price are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      customisable: customisable === "true" || customisable === true,
      image: { url: result.secure_url, public_id: result.public_id },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// EDIT product (admin only). The image is optional here.
router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

        const { name, description, price, stock, customisable } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (customisable !== undefined) {
      product.customisable = customisable === "true" || customisable === true;
    }
    // If a new image was sent, replace the old one
    if (req.file) {
           if (product.image?.public_id) {
        await cloudinary.uploader.destroy(product.image.public_id);
      }
      const result = await uploadToCloudinary(req.file.buffer);
      product.image = { url: result.secure_url, public_id: result.public_id };
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE product (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.image?.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }
    await product.deleteOne();

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;