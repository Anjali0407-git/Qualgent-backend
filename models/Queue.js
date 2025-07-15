const mongoose = require("mongoose");

const QueueSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  status: { type: String, default: "running" },
    date_started: { type: Date, default: Date.now },
  taskName: { type: String, default: "Unknown Task" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Queue", QueueSchema);
