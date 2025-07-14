const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const TestCase = require("../models/TestCase");
const Category = require("../models/Category");
const { cleanJSON } = require("../utils/aiResponseUtils");

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/testcases/search
router.post("/search", auth, async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ msg: "Query is required" });

  try {
    // Step 1: Ask AI to parse the natural language query to filters
    const prompt = `
        You are an assistant that extracts filters from natural language queries to search test cases.
        Available filters: category (string), name (string), description (string).
        Given this query, output a JSON object with these filters to apply in MongoDB find.
        Example:
        Query: "show me all tests in the unit testing category"
        Output: { "category": "unit testing" }

        Query: "${query}"
        Output:
        `;

    const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",  // or your preferred model
    messages: [
        {
        role: "system",
        content:
            "You are an assistant that extracts filters from natural language queries to search test cases. Available filters: category (string), name (string), description (string).",
        },
        {
        role: "user",
        content: `Query: "${query}"\nOutput a JSON object with these filters.`,
        },
    ],
    temperature: 0,
    max_tokens: 150,
    });

      const text = response.choices[0].message.content.trim();
      console.log("Parsed filters:", text);
      const cleanText = cleanJSON(text);

    let filters = {};
    try {
      filters = JSON.parse(cleanText);
    } catch (e) {
        // fallback: no filters
        console.error("Failed to parse AI response as JSON", e);
      filters = {};
    }

    // Build MongoDB query
    const mongoQuery = { user: req.user };

    if (filters.category) {
      // Since category is an ObjectId reference, do a lookup by name
        // First find matching categories by name (case-insensitive)
        const cat = await Category.findOne({ name: new RegExp(filters.category, "i") });
      if (cat) {
        mongoQuery.category = cat._id;
      } else {
          console.log("No matching category found for:", filters.category);
          mongoQuery.category = null;
      }
    }

    if (filters.name) {
      mongoQuery.name = { $regex: filters.name, $options: "i" };
    }
    if (filters.description) {
      mongoQuery.description = { $regex: filters.description, $options: "i" };
      }
      console.log("MongoDB query:", mongoQuery);

    // Query DB
    const testCases = await TestCase.find(mongoQuery)
      .populate("category")
      .populate("files")
      .sort({ updatedAt: -1 });

    res.json(testCases);
  } catch (err) {
    console.error("AI search error", err);
    res.status(500).json({ msg: "Server error" });
  }
});

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
