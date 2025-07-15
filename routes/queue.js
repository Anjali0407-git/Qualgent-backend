const express = require("express");
const router = express.Router();
const Queue = require("../models/Queue");
const TestCase = require("../models/TestCase");
const auth = require("../middleware/auth");

// Get all queues for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const queues = await Queue.find({ user: req.user }).sort({ date_started: -1 });

    // Extract all unique taskIds from queues
    const taskIds = [...new Set(queues.map((q) => q.taskId.toString()))];

    // Fetch tasks by these IDs
    const tasks = await TestCase.find({ _id: { $in: taskIds } }).select("name");

    // Create a map from taskId to task name
    const taskMap = tasks.reduce((acc, task) => {
      acc[task._id.toString()] = task.name;
      return acc;
    }, {});

    // Merge task name into each queue object
    const result = queues.map((queue) => {
      return {
        ...queue.toObject(),
        taskName: taskMap[queue.taskId.toString()] || "Unknown Task",
      };
    });

    res.json(result);
  } catch (err) {
      console.error("Error fetching queues:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create a new queue task
router.post("/", auth, async (req, res) => {
    const { taskId } = req.body;
    console.log("Creating queue task with taskId:", taskId);
  if (!taskId) return res.status(400).json({ msg: "taskId is required" });

  try {
    const queue = new Queue({
      taskId,
      status: "running",
      user: req.user,
    });
      console.log("Queue task created:", queue);
    await queue.save();
    res.status(201).json(queue);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
