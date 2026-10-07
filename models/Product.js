const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    customisable: { type: Boolean, default: false },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true }, // needed to delete from Cloudinary later
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);