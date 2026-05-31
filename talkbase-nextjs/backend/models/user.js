/**
 * backend/models/user.js
 *
 * FIX: Added avatarUrl field to persist the Cloudinary URL for the user's
 * profile picture.  All other fields are unchanged.
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {   // ✅ MUST MATCH BACKEND
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
  },

  // ── Profile avatar (Cloudinary secure URL) ──
  avatarUrl: {
    type: String,
    default: null,
  },

  resetToken:       String,
  resetTokenExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
