const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// STEP A: create a Stripe payment page for an order
router.post("/create-checkout-session/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your order" });
    }
    if (order.paymentMethod !== "stripe") {
      return res.status(400).json({ message: "This order is not a card payment" });
    }
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Order is cancelled" });
    }

    // What the customer sees on the Stripe page (amounts are in fils: 1 AED = 100)
    const line_items = order.items.map((item) => ({
      price_data: {
        currency: "aed",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (order.deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency: "aed",
          product_data: { name: "Delivery fee" },
          unit_amount: Math.round(order.deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: req.user.email,
      metadata: { orderId: order._id.toString() },
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url }); // the frontend sends the user to this link
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// STEP B: after the user returns, confirm with Stripe that payment really happened
router.post("/verify", protect, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const order = await Order.findById(session.metadata.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your order" });
    }

    if (session.payment_status === "paid") {
      if (order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        await order.save();
      }
      return res.json({ message: "Payment successful", order });
    }

    res.status(400).json({ message: "Payment not completed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;