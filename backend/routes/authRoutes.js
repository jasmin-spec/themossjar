const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const checkEmail = require("../utils/checkEmail");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// WhatsApp number: country code first, e.g. +971501234567
const cleanPhone = (p) => String(p || "").replace(/[\s\-()]/g, "");
const PHONE_RE = /^\+[1-9]\d{7,14}$/;

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
  token: makeToken(user._id),
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const whatsapp = cleanPhone(phone);
    if (!PHONE_RE.test(whatsapp)) {
      return res.status(400).json({
        message: "Enter your WhatsApp number with country code, for example +971501234567",
      });
    }

    const check = await checkEmail(email);
    if (!check.ok) {
      return res.status(400).json({ message: check.message });
    }

    const exists = await User.findOne({ email: check.email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: check.email,
      password,
      phone: whatsapp,
      address: String(address).trim(),
    });

    res.status(201).json(userPayload(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(userPayload(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MY PROFILE
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// ALL registered customers (admin only)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;