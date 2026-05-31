const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  apiKey: {
    type: String,
  },
  // ── Added for settings page ──
  domain: {
    type: String,
    default: "",
  },
  supportEmail: {
    type: String,
    default: "",
  },
  apiKeyLastUsed: {
    type: String,
    default: "—",
  },
  // ── Widget settings ──
  widgetTitle: {
    type: String,
    default: "Support Team",
  },
  welcomeMsg: {
    type: String,
    default: "Hi there! 👋 How can we help you today?",
  },
  themeColor: {
    type: String,
    default: "#2563EB",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Business", businessSchema);
