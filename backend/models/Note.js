const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    text: { type: String, required: true },
    summary: { type: String, default: null },
    fileType: { type: String, enum: ["pdf", "txt"], required: true },
    charCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noteSchema.virtual("hasSummary").get(function () {
  return !!this.summary;
});

noteSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Note", noteSchema);
