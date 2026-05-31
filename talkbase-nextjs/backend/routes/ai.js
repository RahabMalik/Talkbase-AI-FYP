/**
 * backend/routes/ai.js
 * =====================
 * Bridges the Node.js backend ↔ Python FastAPI AI server (port 8001).
 *
 * POST   /api/ai/ingest          — ingest free-form text into Pinecone
 * POST   /api/ai/ingest-faq      — ingest a single FAQ Q+A into Pinecone
 * POST   /api/ai/ingest-faq-bulk — ingest multiple FAQs at once (Ingest All button)
 * POST   /api/ai/chat            — answer a customer question via RAG
 * DELETE /api/ai/vectors/:faqId  — delete Pinecone vectors for one FAQ
 *
 * FIXES APPLIED
 * ─────────────
 * 1. Removed duplicate route definitions for /ingest-faq, /ingest-faq-bulk,
 *    and DELETE /vectors/:faqId. Express silently used only the first definition;
 *    the second DELETE /vectors/:faqId was calling /delete (all vectors for the
 *    business) — a data-destruction bug.
 *
 * 2. /api/ai/chat no longer accepts businessId from the request body.
 *    For widget traffic (unauthenticated), the businessId MUST come from the
 *    widget's own API-key header (x-api-key) resolved against the Business
 *    collection.  For authenticated dashboard traffic, it comes from the JWT.
 *    Passing an arbitrary businessId from the body is rejected outright.
 */

const express        = require("express");
const router         = express.Router();
const authMiddleware = require("../middleware/auth");
const jwt            = require("jsonwebtoken");
const Business       = require("../models/Business");

const AI_SERVER = process.env.AI_SERVER_URL || "http://localhost:8001";

/* ── Helper: POST to Python AI server ───────────────────────────────────── */
async function callAI(path, body) {
  const res = await fetch(`${AI_SERVER}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  return res.json();
}

/* ── Helper: resolve businessId safely (never from body) ────────────────── */
/**
 * Returns the businessId string for an incoming request, or null if it cannot
 * be determined from a trusted source.
 *
 * Priority:
 *  1. JWT bearer token  → req.user.businessId  (set by authMiddleware)
 *  2. x-api-key header  → looked up in Business collection
 *
 * The request body is intentionally NOT consulted.
 */
async function resolveBusinessId(req) {
  // 1️⃣  JWT (already verified by authMiddleware or inline below)
  if (req.user && req.user.businessId) {
    return String(req.user.businessId);
  }

  // 2️⃣  Try to decode a bearer token without the authMiddleware having run
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(
        authHeader.slice(7),
        process.env.JWT_SECRET
      );
      if (decoded.businessId) return String(decoded.businessId);
    } catch (_) {
      // invalid / expired — fall through to API-key check
    }
  }

  // 3️⃣  Widget API key (x-api-key header)
  const apiKey = req.headers["x-api-key"];
  if (apiKey) {
    const business = await Business.findOne({ apiKey: String(apiKey) }).select("_id").lean();
    if (business) return String(business._id);
  }

  return null;
}

/* ── POST /api/ai/ingest  (raw text) ─────────────────────────────────────── */
router.post("/ingest", authMiddleware, async (req, res) => {
  try {
    const { text, source = "manual" } = req.body;
    const businessId = String(req.user.businessId);

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const aiResult = await callAI("/ingest", { text, businessId, source });

    if (!aiResult.success) {
      return res.status(500).json({ message: aiResult.error || "AI ingestion failed" });
    }

    res.json({
      message:      "Knowledge ingested successfully",
      chunksStored: aiResult.chunksStored,
      businessId,
    });
  } catch (err) {
    console.error("[AI INGEST ERROR]", err.message);
    res.status(500).json({ message: "AI service unreachable" });
  }
});

/* ── POST /api/ai/ingest-faq  (single FAQ from FAQ page button) ───────────── */
router.post("/ingest-faq", authMiddleware, async (req, res) => {
  try {
    const { faqId, question, answer } = req.body;
    const businessId = String(req.user.businessId);

    if (!question || !answer) {
      return res.status(400).json({ message: "question and answer are required" });
    }

    // Format Q+A as readable text for the embedding
    const text = `Q: ${question.trim()}\nA: ${answer.trim()}`;

    const aiResult = await callAI("/ingest", {
      text,
      businessId,
      source:  "faq",
      faqId:   faqId || null,
    });

    if (!aiResult.success) {
      return res.status(500).json({ message: aiResult.error || "AI ingestion failed" });
    }

    res.json({
      message:      "FAQ ingested into AI knowledge base",
      chunksStored: aiResult.chunksStored,
      faqId,
      businessId,
    });
  } catch (err) {
    console.error("[AI INGEST FAQ ERROR]", err.message);
    res.status(500).json({ message: "AI service unreachable" });
  }
});

/* ── POST /api/ai/ingest-faq-bulk  (Ingest All button) ───────────────────── */
router.post("/ingest-faq-bulk", authMiddleware, async (req, res) => {
  try {
    const { faqs } = req.body;  // [{ faqId, question, answer }]
    const businessId = String(req.user.businessId);

    if (!Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({ message: "faqs array is required" });
    }

    let totalChunks = 0;
    const errors    = [];

    for (const faq of faqs) {
      if (!faq.question || !faq.answer) continue;
      const text = `Q: ${faq.question.trim()}\nA: ${faq.answer.trim()}`;
      try {
        const aiResult = await callAI("/ingest", {
          text,
          businessId,
          source: "faq",
          faqId:  faq.faqId || null,
        });
        if (aiResult.success) {
          totalChunks += aiResult.chunksStored || 0;
        } else {
          errors.push(faq.faqId);
        }
      } catch {
        errors.push(faq.faqId);
      }
    }

    res.json({
      message:      `${faqs.length - errors.length} of ${faqs.length} FAQs ingested`,
      chunksStored: totalChunks,
      failed:       errors,
    });
  } catch (err) {
    console.error("[AI INGEST BULK ERROR]", err.message);
    res.status(500).json({ message: "AI service unreachable" });
  }
});

/* ── DELETE /api/ai/vectors/:faqId  (delete vectors when FAQ is deleted) ─── */
router.delete("/vectors/:faqId", authMiddleware, async (req, res) => {
  try {
    const businessId = String(req.user.businessId);
    const { faqId }  = req.params;

    if (!faqId || faqId.trim() === "") {
      return res.status(400).json({ message: "faqId is required" });
    }

    // Pass BOTH businessId and faqId so the Python server deletes only the
    // vectors that belong to this specific FAQ — not the entire business namespace.
    const aiRes = await fetch(`${AI_SERVER}/delete-faq`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ faqId, businessId }),
    });

    const aiResult = await aiRes.json();

    if (!aiResult.success) {
      return res.status(500).json({ message: aiResult.error || "Vector delete failed" });
    }

    res.json({ message: "Vectors deleted successfully", faqId });
  } catch (err) {
    console.error("[AI VECTOR DELETE ERROR]", err.message);
    res.status(500).json({ message: "AI service unreachable" });
  }
});

/* ── POST /api/ai/chat ────────────────────────────────────────────────────── */
/**
 * SECURITY: businessId is NEVER read from req.body.
 * It is resolved from the JWT bearer token (authenticated users / dashboard)
 * or the x-api-key header (widget traffic).
 * Any businessId supplied in the request body is ignored entirely.
 */
router.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    // ── Resolve businessId from a trusted source only ──────────────────────
    const businessId = await resolveBusinessId(req);

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "question is required" });
    }
    if (!businessId) {
      return res.status(401).json({
        message: "Unauthorized: valid API key or bearer token required",
      });
    }

    const aiResult = await callAI("/chat", {
      question:   question.trim(),
      businessId: String(businessId),
    });

    if (aiResult.error) {
      return res.status(500).json({ message: aiResult.error });
    }

    // Log to MongoDB for analytics / FAQ review
    try {
      const FAQ = require("../models/FAQ");
      const existing = await FAQ.findOne({
        businessId,
        question: {
          $regex: new RegExp(
            "^" + question.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
            "i"
          ),
        },
      });

      if (!existing) {
        await FAQ.create({
          businessId,
          question:   question.trim(),
          answer:     aiResult.resolved ? aiResult.answer : "",
          isAnswered: !!aiResult.resolved,
          source:     "chat",
          category:   "general",
        });
      } else {
        existing.askCount = (existing.askCount || 1) + 1;
        if (aiResult.resolved && !existing.isAnswered) {
          existing.answer     = aiResult.answer;
          existing.isAnswered = true;
        }
        await existing.save();
      }
    } catch (dbErr) {
      console.error("[AI CHAT DB LOG ERROR]", dbErr.message);
    }

    res.json({
      answer:     aiResult.answer,
      confidence: aiResult.confidence,
      resolved:   aiResult.resolved,
    });
  } catch (err) {
    console.error("[AI CHAT ERROR]", err.message);
    res.status(500).json({ message: "AI service unreachable" });
  }
});

module.exports = router;
