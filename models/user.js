const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  resetToken: { type: String }, // ✅ fixed
  resetTokenExpiry: { type: Date } // ✅ fixed
});


const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
