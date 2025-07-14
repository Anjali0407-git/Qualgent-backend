const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  size: Number,
  url: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("File", FileSchema);
