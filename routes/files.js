const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const { uploadFileToBlob } = require("../utils/azureBlob");
const File = require("../models/File");
const upload = multer({ storage: multer.memoryStorage() });

// GET all files for user
router.get("/", auth, async (req, res) => {
  try {
    const files = await File.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// POST upload file(s)
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "File missing" });

    const url = await uploadFileToBlob(req.file);

    const fileDoc = new File({
      name: req.file.originalname,
      size: req.file.size,
      url,
      user: req.user,
    });

    await fileDoc.save();

    res.status(201).json(fileDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed" });
  }
});

// DELETE a file by id
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!file) return res.status(404).json({ msg: "File not found" });

    // Optionally: delete blob from Azure if you want

    res.json({ msg: "File deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
