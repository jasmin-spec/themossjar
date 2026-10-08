const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const seedAdmin = require("./utils/seedAdmin");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Terrarium API is running 🌱");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));   // new
app.use("/api/orders", require("./routes/orderRoutes")); 
app.use("/api/payments", require("./routes/paymentRoutes"));
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedAdmin(); // creates the admin on first run
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log("DB error:", err.message));