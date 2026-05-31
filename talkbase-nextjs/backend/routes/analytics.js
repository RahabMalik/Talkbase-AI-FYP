/**
 * backend/routes/analytics.js
 *
 * FIX APPLIED
 * ───────────
 * The POST /api/analytics/visitor endpoint previously accepted any businessId
 * with no authentication, letting anyone spam visitor counts for any business.
 *
 * Fix: The widget must now supply a valid x-api-key header.  The businessId is
 * resolved from that key (looked up in the Business collection) and the body's
 * businessId is ignored entirely.  Invalid or missing keys receive a 401.
 *
 * A lightweight per-IP rate limit (60 req/min) is also applied to this endpoint
 * to prevent high-volume abuse even from a single IP holding a valid key.
 */

const express        = require("express");
const router         = express.Router();
const rateLimit      = require("express-rate-limit");
const FAQ            = require("../models/FAQ");
const Visitor        = require("../models/Visitor");
const Business       = require("../models/Business");
const authMiddleware = require("../middleware/auth");

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ── Rate limiter for the public visitor-ping endpoint ───────────────────── */
const visitorPingLimiter = rateLimit({
  windowMs:         60 * 1000, // 1 minute
  max:              60,         // 60 pings per IP per minute
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { ok: false, message: "Too many requests" },
});

/* ── POST /api/analytics/visitor  (called by widget.js) ─────────────────── */
/**
 * SECURITY FIX: businessId is no longer accepted from the request body.
 * The caller must supply a valid business API key via the x-api-key header.
 * We look up the Business from that key and use its _id as the authoritative
 * businessId.  An unrecognised key returns 401.
 */
router.post("/visitor", visitorPingLimiter, async (req, res) => {
  const { visitorId } = req.body;
  const apiKey        = req.headers["x-api-key"];

  if (!apiKey || !visitorId) {
    return res.status(400).json({ ok: false, message: "x-api-key header and visitorId are required" });
  }

  try {
    // Resolve businessId from the API key — never from the request body
    const business = await Business.findOne({ apiKey: String(apiKey) }).select("_id").lean();
    if (!business) {
      return res.status(401).json({ ok: false, message: "Invalid API key" });
    }

    const businessId = String(business._id);

    await Visitor.findOneAndUpdate(
      { visitorId: String(visitorId) },
      { businessId, lastSeen: new Date() },
      { upsert: true, new: true }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("[VISITOR PING ERROR]", err.message);
    res.status(500).json({ ok: false });
  }
});

/* ── GET /api/analytics/active-visitors  (dashboard — needs auth) ───────── */
router.get("/active-visitors", authMiddleware, async (req, res) => {
  const businessId = String(req.user.businessId);
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const count = await Visitor.countDocuments({
      businessId,
      lastSeen: { $gte: fiveMinAgo },
    });
    res.json({ activeVisitors: count });
  } catch (err) {
    res.json({ activeVisitors: 0 });
  }
});

/* ── GET /api/analytics/conversations  (chat logs — needs auth) ─────────── */
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const businessId = String(req.user.businessId);
    const page       = Math.max(1, parseInt(req.query.page)  || 1);
    const limit      = Math.min(50, parseInt(req.query.limit) || 20);
    const skip       = (page - 1) * limit;

    const filter = { businessId, source: "chat" };

    const [logs, total] = await Promise.all([
      FAQ.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("question answer isAnswered askCount category createdAt updatedAt"),
      FAQ.countDocuments(filter),
    ]);

    res.json({
      logs: logs.map(f => ({
        id:         f._id,
        question:   f.question,
        answer:     f.answer || null,
        isAnswered: f.isAnswered,
        askCount:   f.askCount,
        category:   f.category,
        createdAt:  f.createdAt,
        updatedAt:  f.updatedAt,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[CONVERSATIONS ERROR]", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ── GET /api/analytics  (main analytics — needs auth) ──────────────────── */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const businessId = String(req.user.businessId);
    const range      = req.query.range || "30";

    let dateFilter = {};
    if (range !== "all") {
      dateFilter = { createdAt: { $gte: daysAgo(Number(range)) } };
    }

    const baseFilter = { businessId, ...dateFilter };
    const prevDateFilter = {};
    if (range !== "all") {
      const days = Number(range);
      prevDateFilter.createdAt = {
        $gte: daysAgo(days * 2),
        $lt:  daysAgo(days),
      };
    }
    const prevFilter = { businessId, ...prevDateFilter };

    const [totalFAQs, answeredFAQs, unansweredFAQs, topUnanswered] = await Promise.all([
      FAQ.countDocuments(baseFilter),
      FAQ.countDocuments({ ...baseFilter, isAnswered: true  }),
      FAQ.countDocuments({ ...baseFilter, isAnswered: false }),
      FAQ.find({ ...baseFilter, isAnswered: false })
        .sort({ askCount: -1 }).limit(5)
        .select("question askCount category"),
    ]);

    const [prevTotal, prevAnswered] = await Promise.all([
      FAQ.countDocuments(prevFilter),
      FAQ.countDocuments({ ...prevFilter, isAnswered: true }),
    ]);

    const askAgg = await FAQ.aggregate([
      { $match: baseFilter },
      { $group: { _id: null, total: { $sum: "$askCount" } } },
    ]);
    const totalConversations = askAgg[0]?.total || 0;

    const prevAskAgg = await FAQ.aggregate([
      { $match: prevFilter },
      { $group: { _id: null, total: { $sum: "$askCount" } } },
    ]);
    const prevConversations = prevAskAgg[0]?.total || 0;

    const resolutionRate = totalFAQs > 0
      ? ((answeredFAQs / totalFAQs) * 100).toFixed(1) : "0.0";
    const prevResRate = prevTotal > 0
      ? ((prevAnswered / prevTotal) * 100).toFixed(1) : "0.0";

    function pctChange(curr, prev) {
      if (prev === 0) return curr > 0 ? "+100%" : "—";
      const pct = (((curr - prev) / prev) * 100).toFixed(1);
      return Number(pct) >= 0 ? `+${pct}%` : `${pct}%`;
    }

    // Active visitors (last 5 min, this business) — from MongoDB
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeVisitors = await Visitor.countDocuments({
      businessId,
      lastSeen: { $gte: fiveMinAgo },
    });

    // Chart (last 7 days)
    const dayLabels = [], dayTotals = [], dayUnres = [];
    for (let i = 6; i >= 0; i--) {
      const start = daysAgo(i);
      const end   = new Date(start); end.setDate(end.getDate() + 1);
      const dayFilter = { businessId, createdAt: { $gte: start, $lt: end } };
      const [tot, unr] = await Promise.all([
        FAQ.countDocuments(dayFilter),
        FAQ.countDocuments({ ...dayFilter, isAnswered: false }),
      ]);
      dayLabels.push(start.toLocaleDateString("en-US", { weekday: "short" }));
      dayTotals.push(tot);
      dayUnres.push(unr);
    }

    res.json({
      totalConversations,
      totalConversationsChange: pctChange(totalConversations, prevConversations),
      resolutionRate:           `${resolutionRate}%`,
      resolutionRateChange:     pctChange(Number(resolutionRate), Number(prevResRate)),
      totalFAQs,
      totalFAQsChange:      pctChange(totalFAQs,    prevTotal),
      unansweredFAQs,
      unansweredFAQsChange: pctChange(unansweredFAQs, prevTotal - prevAnswered),
      activeVisitors,
      topUnanswered: topUnanswered.map(f => ({
        topic: f.question, count: f.askCount, category: f.category,
      })),
      chart: { labels: dayLabels, totals: dayTotals, unresolved: dayUnres },
      businessId,
      range,
    });
  } catch (err) {
    console.error("[ANALYTICS ERROR]", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
