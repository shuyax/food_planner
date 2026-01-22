const express = require("express");
const multer = require("multer");
const path = require("path")
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use environment variable UPLOAD_DIR or fallback to "uploads"
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Save with original name + timestamp + extension
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);

        cb(null, `${name}-${Date.now()}${ext}`)
    }
});

const upload = multer({storage});


module.exports = upload;