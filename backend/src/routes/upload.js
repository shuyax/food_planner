const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload")  // import multer config


// Upload **multiple images** (up to 10 files)
router.post("/", upload.array("files", 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).send("No files uploaded");

  const filenames = req.files.map((f) => f.filename);
  res.json({ files: filenames });
});

module.exports = router;