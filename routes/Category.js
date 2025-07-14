const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const auth = require("../middleware/auth");

// Get all categories for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Create a category
router.post("/", auth, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ msg: "Name is required" });

  try {
    const category = new Category({ name, description, user: req.user });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update a category by ID
router.put("/:id", auth, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ msg: "Name is required" });

  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { name, description },
      { new: true }
    );
    if (!category) return res.status(404).json({ msg: "Category not found" });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete a category by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user });
    if (!category) return res.status(404).json({ msg: "Category not found" });

    await TestCase.deleteMany({ category: category._id });
    await category.remove();
    res.json({ msg: "Category and related test cases deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
    