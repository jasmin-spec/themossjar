const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const sendOrderEmails = require("../utils/sendEmail");
const {
  SIZE_EXTRA, CONTAINER_EXTRA, PLANT_OPTIONS, PLANT_PRICE,
  THEME_EXTRA, MINIATURE_PRICES, SCULPTURE_PRICES,
  MAX_MINIATURES, MAX_SCULPTURES, DELIVERY_FEE,
} = require("../utils/pricing");

const router = express.Router();

const asArray = (v) => (Array.isArray(v) ? v : []);

// Customisation options (the frontend builds its form from this)
router.get("/options", (req, res) => {
  res.json({
    sizes: SIZE_EXTRA,
    containers: CONTAINER_EXTRA,
    plants: PLANT_OPTIONS,
    plantPrice: PLANT_PRICE,
    themes: THEME_EXTRA,
    miniatures: MINIATURE_PRICES,
    sculptures: SCULPTURE_PRICES,
    maxMiniatures: MAX_MINIATURES,
    maxSculptures: MAX_SCULPTURES,
    deliveryFee: DELIVERY_FEE,
  });
});

// CREATE order (logged-in users). The SERVER calculates every price.
router.post("/", protect, async (req, res) => {
  try {
    const { items, deliveryMode, deliveryAddress, phone } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }
    if (!["delivery", "pickup"].includes(deliveryMode)) {
      return res.status(400).json({ message: "Choose delivery or pickup" });
    }

    const orderItems = [];
    const stockChanges = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: "A product was not found" });
      }

      const quantity = Math.max(1, Math.floor(Number(item.quantity)) || 1);
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      // Only products marked Customisable can be customised
      const wantsCustom =
        product.customisable === true &&
        !!item.customisation &&
        !!item.customisation.size &&
        item.customisation.size !== "ready-made";

      let unitPrice;
      let customisation;

      if (wantsCustom) {
        const c = item.customisation;
        const size = c.size;
        const container = c.container || "glass jar";

        if (!Object.hasOwn(SIZE_EXTRA, size) || !Object.hasOwn(CONTAINER_EXTRA, container)) {
          return res.status(400).json({ message: "Invalid size or container" });
        }

        const plants = [...new Set(asArray(c.plants))].filter((p) => PLANT_OPTIONS.includes(p));
        const theme = Object.hasOwn(THEME_EXTRA, c.theme) ? c.theme : "none";
        const miniatures = [...new Set(asArray(c.miniatures))]
          .filter((m) => Object.hasOwn(MINIATURE_PRICES, m))
          .slice(0, MAX_MINIATURES);
        const sculptures = [...new Set(asArray(c.sculptures))]
          .filter((s) => Object.hasOwn(SCULPTURE_PRICES, s))
          .slice(0, MAX_SCULPTURES);

        unitPrice =
          product.price +
          SIZE_EXTRA[size] +
          CONTAINER_EXTRA[container] +
          plants.length * PLANT_PRICE +
          THEME_EXTRA[theme] +
          miniatures.reduce((sum, m) => sum + MINIATURE_PRICES[m], 0) +
          sculptures.reduce((sum, s) => sum + SCULPTURE_PRICES[s], 0);

        customisation = {
          size, container, plants, theme, miniatures, sculptures,
          message: String(c.message || "").slice(0, 200),
        };
      } else {
        unitPrice = product.price;
        customisation = {
          size: "ready-made",
          container: "as shown in photo",
          plants: [],
          theme: "none",
          miniatures: [],
          sculptures: [],
          message: String(item.customisation?.message || "").slice(0, 200),
        };
      }

      itemsPrice += unitPrice * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image?.url || "",
        price: unitPrice,
        quantity,
        customisation,
      });
      stockChanges.push({ product, quantity });
    }

    // Everything is valid: now reduce the stock
    for (const { product, quantity } of stockChanges) {
      product.stock -= quantity;
      await product.save();
    }

    const deliveryFee = DELIVERY_FEE[deliveryMode];
    const address =
      deliveryMode === "delivery" ? deliveryAddress || req.user.address : "Store pickup";

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryMode,
      deliveryAddress: address,
      phone: phone || req.user.phone,
      itemsPrice,
      deliveryFee,
      totalPrice: itemsPrice + deliveryFee,
      paymentMethod: "cod", // pay on delivery or pickup (confirmed on WhatsApp)
    });

    sendOrderEmails(order, req.user); // optional emails; never blocks the order

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MY orders
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ALL orders (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ONE order (the owner or the admin)
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone address");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE order status (admin only)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const { orderStatus } = req.body;
    const allowed = Order.schema.path("orderStatus").enumValues;
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    order.orderStatus = orderStatus;

    // Pay-on-delivery orders become "paid" when delivered
    if (orderStatus === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE order (admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;