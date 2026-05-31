const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  visitorId:  { type: String, required: true },
  businessId: { type: String, required: true },
  lastSeen:   { type: Date,   default: Date.now },
});

// One document per unique visitor — upsert on each ping
visitorSchema.index({ visitorId: 1 }, { unique: true });
visitorSchema.index({ businessId: 1, lastSeen: 1 });

module.exports = mongoose.model("Visitor", visitorSchema);
