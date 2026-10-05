const User = require("../models/User");

const seedAdmin = async () => {
  const exists = await User.findOne({ role: "admin" });
  if (exists) return console.log("Admin already exists");

  await User.create({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    phone: "0000000000",
    address: "Admin Office",
    role: "admin",
  });
  console.log("Admin created ✅");
};

module.exports = seedAdmin;