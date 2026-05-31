/**
 * backend/models/FAQ.js
 *
 * FIXES APPLIED
 * ─────────────
 * 1. Added `isIngested` (Boolean) and `ingestedAt` (Date) fields so the
 *    "In AI" badge persists across page refreshes instead of resetting on
 *    every load.  The FAQ page now reads these from the API response.
 *
 * 2. The ingest routes (routes/ai.js) update these fields when a FAQ is
 *    successfully ingested into Pinecone.  See routes/faq.js answer update
 *    which also clears isIngested when an answer changes (re-ingest needed).
 */

const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },

  question: {
    type: String,
    required: true,
    trim: true,
  },

  answer: {
    type: String,
    default: "",
    trim: true,
  },

  category: {
    type: String,
    enum: ["fashion", "ecommerce", "food", "pharmacy", "general"],
    default: "general",
  },

  askCount: {
    type: Number,
    default: 1,
  },

  isAnswered: {
    type: Boolean,
    default: false,
  },

  // FIX: persist ingest state so "In AI" badge survives page refresh
  isIngested: {
    type: Boolean,
    default: false,
  },
  ingestedAt: {
    type: Date,
    default: null,
  },

  source: {
    type: String,
    enum: ["chat", "manual"],
    default: "manual",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

faqSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

faqSchema.index({ businessId: 1 });
faqSchema.index({ businessId: 1, isAnswered: 1 });
faqSchema.index({ businessId: 1, source: 1 });
faqSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model("FAQ", faqSchema);
