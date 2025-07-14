const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const TestCase = require("../models/TestCase");

// GET all test cases, populate category and files
router.get("/", auth, async (req, res) => {
  try {
    const testCases = await TestCase.find({ user: req.user })
      .populate("category")
      .populate("files")
      .sort({ updatedAt: -1 });
    res.json(testCases);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET single test case with populated files and category
router.get("/:id", auth, async (req, res) => {
  try {
    const testCase = await TestCase.findOne({ _id: req.params.id, user: req.user })
      .populate("category")
      .populate("files");
    if (!testCase) return res.status(404).json({ msg: "Test case not found" });
    res.json(testCase);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// CREATE test case: accept file ids in body (no file uploads here)
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, category, files } = req.body;
    if (!name) return res.status(400).json({ msg: "Name is required" });

    const testCase = new TestCase({
      name,
      description,
      category,
      files, // array of file ids
      user: req.user,
    });

    await testCase.save();
    const populated = await testCase.populate(['category', 'files']);
    res.status(201).json(populated);
  } catch (err) {
      console.error(err);
      
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE test case: update file ids, no uploads
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description, category, files } = req.body;
    if (!name) return res.status(400).json({ msg: "Name is required" });

    const testCase = await TestCase.findOne({ _id: req.params.id, user: req.user });
    if (!testCase) return res.status(404).json({ msg: "Test case not found" });

    testCase.name = name;
    testCase.description = description;
    testCase.category = category;
    testCase.files = files;

    await testCase.save();
    const populated = await testCase.populate("category").populate("files");
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE test case
router.delete("/:id", auth, async (req, res) => {
  try {
    const testCase = await TestCase.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!testCase) return res.status(404).json({ msg: "Test case not found" });
    res.json({ msg: "Test case deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
