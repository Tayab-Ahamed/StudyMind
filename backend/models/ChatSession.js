const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true, index: true },
    title: { type: String, default: "New Chat" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Auto-title from first user message
chatSessionSchema.pre("save", function (next) {
  if (this.isModified("messages") && this.messages.length === 1) {
    const first = this.messages[0].content;
    this.title = first.length > 50 ? first.slice(0, 47) + "…" : first;
  }
  next();
});

module.exports = mongoose.model("ChatSession", chatSessionSchema);
