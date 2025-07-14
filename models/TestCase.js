const mongoose = require("mongoose");

const TestCaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("TestCase", TestCaseSchema);

