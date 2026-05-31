/**
 * backend/routes/faq.js
 *
 * FIXES APPLIED
 * ─────────────
 * 1. PUT /:id/answer now clears isIngested=false / ingestedAt=null when the
 *    answer changes, so the badge correctly shows "Re-ingest needed" after
 *    an edit rather than the stale "In AI" state.
 *
 * 2. POST /mark-ingested — new internal endpoint called by routes/ai.js after
 *    a successful Pinecone ingest to persist isIngested=true in MongoDB.
 *    This is what makes the badge survive page refresh.
 */

const express = require("express");
const router = express.Router();
const FAQ = require("../models/FAQ");
const authMiddleware = require("../middleware/auth");

// LIST FAQs for the authenticated user's business
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { answered, sort } = req.query;
    const businessId = req.user.businessId;

    const filter = { businessId };
    if (answered === "true")  filter.isAnswered = true;
    if (answered === "false") filter.isAnswered = false;

    const sortOrder =
      sort === "newest" ? { createdAt: -1 } : { askCount: -1 };

    const faqs = await FAQ.find(filter).sort(sortOrder);
    res.json({ faqs });
  } catch (err) {
    console.error("FAQ LIST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// CREATE MANUAL FAQ
router.post("/manual", authMiddleware, async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    const businessId = req.user.businessId;

    if (!businessId || !question) {
      return res.status(400).json({
        message: "businessId and question are required",
      });
    }

    const faq = await FAQ.create({
      businessId,
      question,
      answer:     answer || "",
      isAnswered: !!(answer && answer.trim()),
      category:   category || "general",
      source:     "manual",
      isIngested: false,
      ingestedAt: null,
    });

    res.status(201).json({ faq });
  } catch (err) {
    console.error("FAQ CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE ANSWER
// FIX: clears isIngested when the answer is changed — the old vectors are
// now stale so the badge correctly prompts a re-ingest.
router.put("/:id/answer", authMiddleware, async (req, res) => {
  try {
    const { answer } = req.body;
    const businessId = req.user.businessId;

    const faq = await FAQ.findOne({ _id: req.params.id, businessId });
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    const answerChanged = faq.answer !== answer;

    faq.answer     = answer;
    faq.isAnswered = answer && answer.trim().length > 0;

    // FIX: mark as not ingested when the answer changes so user knows to re-ingest
    if (answerChanged) {
      faq.isIngested = false;
      faq.ingestedAt = null;
    }

    await faq.save();

    res.json({ faq });
  } catch (err) {
    console.error("FAQ ANSWER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// MARK FAQ(s) AS INGESTED — called internally by routes/ai.js after Pinecone success
// FIX: this is the endpoint that makes "In AI" badge persist across refreshes
router.post("/mark-ingested", authMiddleware, async (req, res) => {
  try {
    const { faqIds } = req.body; // array of FAQ _id strings
    const businessId = req.user.businessId;

    if (!Array.isArray(faqIds) || faqIds.length === 0) {
      return res.status(400).json({ message: "faqIds array is required" });
    }

    await FAQ.updateMany(
      { _id: { $in: faqIds }, businessId },
      { $set: { isIngested: true, ingestedAt: new Date() } }
    );

    res.json({ message: "Marked as ingested", count: faqIds.length });
  } catch (err) {
    console.error("FAQ MARK INGESTED ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE FAQ
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const faq = await FAQ.findOneAndDelete({ _id: req.params.id, businessId });
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json({ message: "FAQ deleted" });
  } catch (err) {
    console.error("FAQ DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
