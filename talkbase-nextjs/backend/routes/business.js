/**
 * backend/routes/business.js
 *
 * FIX APPLIED
 * ───────────
 * Added GET /api/business/by-api-key — used by the widget to resolve the
 * businessId from the x-api-key header without exposing internal IDs in
 * the embed script.  This is an authenticated-by-api-key endpoint; it
 * only returns the businessId (not the full document).
 */

const express  = require("express");
const router   = express.Router();
const { v4: uuidv4 } = require("uuid");

const Business       = require("../models/Business");
const authMiddleware = require("../middleware/auth");

/* ── GET /api/business/by-api-key  (widget key → businessId) ─────────────── */
/**
 * Called by widget.js to resolve the businessId from an API key header.
 * Returns only { businessId } — no other data exposed.
 *
 * The widget must supply:  x-api-key: <business api key>
 */
router.get("/by-api-key", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(400).json({ message: "x-api-key header is required" });
  }

  try {
    const business = await Business.findOne({ apiKey: String(apiKey) })
      .select("_id")
      .lean();

    if (!business) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    res.json({ businessId: String(business._id) });
  } catch (err) {
    console.error("[BUSINESS BY-API-KEY ERROR]", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ── GET /api/business/:id/widget-settings  (PUBLIC) ── */
router.get("/:id/widget-settings", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .select("widgetTitle welcomeMsg themeColor name");
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json({
      widgetTitle: business.widgetTitle || "Support Team",
      welcomeMsg:  business.welcomeMsg  || "Hi there! How can we help you today?",
      themeColor:  business.themeColor  || "#2563EB",
      name:        business.name        || "",
    });
  } catch (err) {
    console.error("[WIDGET SETTINGS GET ERROR]", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ── GET /api/business/:id ── */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (String(business.ownerId) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json({
      _id:            business._id,
      name:           business.name,
      domain:         business.domain         || "",
      supportEmail:   business.supportEmail   || "",
      apiKey:         business.apiKey         || "",
      apiKeyLastUsed: business.apiKeyLastUsed || "—",
      widgetTitle:    business.widgetTitle    || "Support Team",
      welcomeMsg:     business.welcomeMsg     || "Hi there! How can we help you today?",
      themeColor:     business.themeColor     || "#2563EB",
      createdAt:      business.createdAt,
    });
  } catch (err) {
    console.error("[BUSINESS GET ERROR]", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ── PUT /api/business/:id ── */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, domain, supportEmail, widgetTitle, welcomeMsg, themeColor } = req.body;
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (String(business.ownerId) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (name         !== undefined) business.name         = name.trim();
    if (domain       !== undefined) business.domain       = domain.trim();
    if (supportEmail !== undefined) business.supportEmail = supportEmail.trim();
    if (widgetTitle  !== undefined) business.widgetTitle  = widgetTitle.trim();
    if (welcomeMsg   !== undefined) business.welcomeMsg   = welcomeMsg.trim();
    if (themeColor   !== undefined) business.themeColor   = themeColor.trim();
    await business.save();
    res.json({
      message:      "Business updated successfully",
      _id:          business._id,
      name:         business.name,
      domain:       business.domain,
      supportEmail: business.supportEmail,
      widgetTitle:  business.widgetTitle,
      welcomeMsg:   business.welcomeMsg,
      themeColor:   business.themeColor,
    });
  } catch (err) {
    console.error("[BUSINESS PUT ERROR]", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ── POST /api/business/:id/regenerate-key ── */
router.post("/:id/regenerate-key", authMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (String(business.ownerId) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    business.apiKey         = uuidv4();
    business.apiKeyLastUsed = "Just now";
    await business.save();
    res.json({ message: "API key regenerated", apiKey: business.apiKey });
  } catch (err) {
    console.error("[BUSINESS REGEN KEY ERROR]", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
