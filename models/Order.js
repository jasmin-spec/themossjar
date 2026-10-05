const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,           // saved copy, so the order stays correct even if the product changes
  image: String,
  price: Number,          // final price for ONE item after customisation
  quantity: { type: Number, default: 1 },
  customisation: {
    size: String,
    container: String,
    plants: [String],
    message: String,      // e.g. a gift note
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],

    deliveryMode: { type: String, enum: ["delivery", "pickup"], required: true },
    deliveryAddress: String,
    phone: String,

    itemsPrice: Number,
    deliveryFee: Number,
    totalPrice: Number,

    paymentMethod: { type: String, enum: ["stripe", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: Date,
    stripeSessionId: String, // used in Phase 5

    orderStatus: {
      type: String,
      enum: ["placed", "preparing", "out for delivery", "ready for pickup", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);