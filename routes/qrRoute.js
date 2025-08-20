const express = require("express");
const router = express.Router();
const { createQrEntry,getEntry,getAnalytics, getAllEntries, updateQrEntry } = require("../controllers/qr");
const multer = require("multer");
const path = require("path");
const authenticateUser = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

/**
 * @route POST /api/qr
 * @desc Create a new QR entry
 * @access Private
 */
router.post("/",authenticateUser, upload.array("images"), createQrEntry);
router.put('/update', authenticateUser, upload.array('images'), updateQrEntry);
router.get("/:uniqueId", getEntry);
router.get("/userentry/:uniqueId", getAnalytics)
router.get("/user/userentries/all",authenticateUser, getAllEntries);
module.exports = router;