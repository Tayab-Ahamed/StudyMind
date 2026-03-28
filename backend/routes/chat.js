const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const auth = require("../middleware/auth");
const Note = require("../models/Note");
const ChatSession = require("../models/ChatSession");

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.use(auth);

// POST /api/chat/session
router.post("/session", async (req, res, next) => {
  try {
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ error: "noteId is required." });
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found." });

    const session = await ChatSession.create({ user: req.user._id, note: noteId, messages: [] });
    res.status(201).json({ sessionId: session._id, noteId });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/:sessionId/message
router.post("/:sessionId/message", async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ error: "Session not found." });

    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "message is required." });

    const note = await Note.findById(session.note);
    if (!note) return res.status(404).json({ error: "Associated note not found." });

    // Build message history for Claude
    const history = session.messages.map(m => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: message.trim() });

    const aiResponse = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are a knowledgeable and friendly AI study assistant. The student has uploaded study notes and wants to learn from them. Answer questions clearly and concisely based on the notes. If the answer isn't in the notes, say so and offer general knowledge if helpful.\n\n--- STUDY NOTES ---\n${note.text.slice(0, 15000)}\n--- END OF NOTES ---`,
      messages: history,
    });

    const reply = aiResponse.content[0].text;
    session.messages.push({ role: "user", content: message.trim() });
    session.messages.push({ role: "assistant", content: reply });
    await session.save();

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/:sessionId/history
router.get("/:sessionId/history", async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.sessionId, user: req.user._id });
    if (!session) return res.status(404).json({ error: "Session not found." });
    res.json({ messages: session.messages, noteId: session.note, title: session.title });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/sessions/:noteId
router.get("/sessions/:noteId", async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ note: req.params.noteId, user: req.user._id })
      .select("-messages")
      .sort({ updatedAt: -1 });
    res.json(sessions.map(s => ({ id: s._id, title: s.title, createdAt: s.createdAt, updatedAt: s.updatedAt })));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/:sessionId
router.delete("/:sessionId", async (req, res, next) => {
  try {
    await ChatSession.findOneAndDelete({ _id: req.params.sessionId, user: req.user._id });
    res.json({ message: "Session deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
