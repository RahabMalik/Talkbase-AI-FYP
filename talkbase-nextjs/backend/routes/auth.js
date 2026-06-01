/**
 * backend/routes/auth.js
 *
 * FIXES APPLIED
 * ─────────────
 * 1. Replaced nodemailer/SMTP with Resend HTTP API — works on Render free tier
 *    (Render blocks outbound SMTP ports 25/465/587).
 *    Requires RESEND_API_KEY in your .env / Render environment variables.
 *
 * 2. Real avatar upload via Cloudinary — POST /api/auth/me/avatar accepts a
 *    multipart file, uploads it to Cloudinary, stores the secure_url in the
 *    User.avatarUrl field, and returns it.  The file is never written to disk.
 *    The "Change Avatar" button in Settings now does a real upload.
 */

const express    = require("express");
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const crypto     = require("crypto");
const { Resend } = require("resend");
const multer     = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const User           = require("../models/user");
const Business       = require("../models/Business");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/* ── Resend configuration ─────────────────────────────────────────────────── */
const resend = new Resend(process.env.RESEND_API_KEY);

/* ── Cloudinary configuration ─────────────────────────────────────────────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ── Multer — memory storage (no disk writes) ─────────────────────────────── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

/* ── SIGNUP ───────────────────────────────────────────────────────────────── */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey         = uuidv4();

    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      apiKey,
    });

    await Business.create({
      name:    `${name}'s Business`,
      email,
      ownerId: user._id,
      apiKey:  uuidv4(),
    });

    res.json({ message: "Signup successful", apiKey });
  } catch (error) {
    console.error("SIGNUP ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/* ── LOGIN ────────────────────────────────────────────────────────────────── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const business = await Business.findOne({ ownerId: user._id });

    const token = jwt.sign(
      { userId: user._id, apiKey: user.apiKey, businessId: business?._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message:    "Login successful",
      token,
      apiKey:     user.apiKey,
      businessId: business?._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ── GET /api/auth/me  (settings page — load profile) ────────────────────── */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      avatarUrl: user.avatarUrl || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ── PUT /api/auth/me  (settings page — save profile) ────────────────────── */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) return res.status(400).json({ message: "Email already in use" });
      user.email = email.trim();
    }

    if (name) user.name = name.trim();

    await user.save();

    res.json({
      message:   "Profile updated successfully",
      name:      user.name,
      email:     user.email,
      avatarUrl: user.avatarUrl || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ── POST /api/auth/me/avatar  (real Cloudinary upload) ──────────────────── */
router.post(
  "/me/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY    ||
      !process.env.CLOUDINARY_API_SECRET ||
      process.env.CLOUDINARY_CLOUD_NAME === "your-cloud-name"
    ) {
      return res.status(503).json({
        message:
          "Avatar upload is not configured. Please set CLOUDINARY_CLOUD_NAME, " +
          "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
      });
    }

    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder:         "talkbase/avatars",
            public_id:      `user_${req.user.userId}`,
            overwrite:      true,
            transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.avatarUrl = uploadResult.secure_url;
      await user.save();

      res.json({
        message:   "Avatar uploaded successfully",
        avatarUrl: uploadResult.secure_url,
      });
    } catch (err) {
      console.error("[AVATAR UPLOAD ERROR]", err.message);
      res.status(500).json({ message: "Avatar upload failed. Please try again." });
    }
  }
);

/* ── DELETE /api/auth/me/avatar  (remove avatar) ─────────────────────────── */
router.delete("/me/avatar", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.avatarUrl) {
      try {
        await cloudinary.uploader.destroy(`talkbase/avatars/user_${req.user.userId}`);
      } catch (cdnErr) {
        console.warn("[AVATAR DELETE CDN]", cdnErr.message);
      }
    }

    user.avatarUrl = null;
    await user.save();

    res.json({ message: "Avatar removed" });
  } catch (err) {
    console.error("[AVATAR DELETE ERROR]", err.message);
    res.status(500).json({ message: "Failed to remove avatar" });
  }
});

/* ── FORGOT PASSWORD ──────────────────────────────────────────────────────── */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken       = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 min
    await user.save();

    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from:    "TalkBase <onboarding@resend.dev>", // swap for your domain once verified
        to:      email,
        subject: "Password Reset",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password (expires in 15 minutes):</p>
          <a href="${resetLink}">Reset Password</a>
          <p>If you did not request this, you can safely ignore this email.</p>
        `,
      });
    } catch (mailErr) {
      console.error("[FORGOT PASSWORD] Email send failed:", mailErr.message);
      user.resetToken       = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return res.status(502).json({
        message: "Failed to send reset email. Please try again later or contact support.",
      });
    }

    res.json({ message: "Reset email sent" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error.message);
    res.status(500).json({ message: "An unexpected error occurred. Please try again." });
  }
});

/* ── RESET PASSWORD ───────────────────────────────────────────────────────── */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken:       token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.passwordHash      = await bcrypt.hash(newPassword, 10);
    user.resetToken        = undefined;
    user.resetTokenExpiry  = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;