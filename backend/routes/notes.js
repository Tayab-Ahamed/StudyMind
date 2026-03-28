const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Anthropic = require("@anthropic-ai/sdk");
const auth = require("../middleware/auth");
const Note = require("../models/Note");
const ChatSession = require("../models/ChatSession");

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// All note routes require auth
router.use(auth);

// Multer: memory storage, PDF + txt only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Windows sometimes sends text/plain as application/octet-stream for .txt
    const okMime = ["application/pdf", "text/plain", "application/octet-stream"];
    const okExt = file.originalname.toLowerCase();
    if (okMime.includes(file.mimetype) || okExt.endsWith(".txt") || okExt.endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and .txt files are supported."));
    }
  },
});

// POST /api/notes/upload
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided. Make sure the field name is 'file'." });
    }

    const filename = req.file.originalname.toLowerCase();
    const isPdf = filename.endsWith(".pdf") || req.file.mimetype === "application/pdf";

    let text = "";
    if (isPdf) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        text = parsed.text;
      } catch (pdfErr) {
        return res.status(422).json({ error: "Could not parse PDF. Make sure it's not password-protected." });
      }
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return res.status(422).json({ error: "File appears to be empty or text could not be extracted." });
    }

    const note = await Note.create({
      user: req.user._id,
      name: req.file.originalname,
      text: text.trim(),
      fileType: isPdf ? "pdf" : "txt",
      charCount: text.trim().length,
    });

    res.status(201).json({
      id: note._id,
      name: note.name,
      hasSummary: false,
      fileType: note.fileType,
      charCount: note.charCount,
      createdAt: note.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/notes/:id/summarize
router.post("/:id/summarize", async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found." });
    if (note.summary) return res.json({ summary: note.summary });

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Provide a clear, structured summary of these study notes.\n\nInclude:\n- Brief overview (2-3 sentences)\n- Key concepts and main points (bullet list)\n- Important terms or definitions (if any)\n\nNotes:\n---\n${note.text.slice(0, 15000)}\n---`,
      }],
    });

    note.summary = msg.content[0].text;
    await note.save();
    res.json({ summary: note.summary });
  } catch (err) {
    next(err);
  }
});

// GET /api/notes
router.get("/", async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id })
      .select("-text")
      .sort({ createdAt: -1 });
    res.json(notes.map(n => ({
      id: n._id,
      name: n.name,
      hasSummary: !!n.summary,
      fileType: n.fileType,
      charCount: n.charCount,
      createdAt: n.createdAt,
    })));
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id
router.get("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id }).select("-text");
    if (!note) return res.status(404).json({ error: "Note not found." });
    res.json({ id: note._id, name: note.name, hasSummary: !!note.summary, summary: note.summary, charCount: note.charCount, createdAt: note.createdAt });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found." });
    await ChatSession.deleteMany({ note: req.params.id, user: req.user._id });
    res.json({ message: "Note deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
