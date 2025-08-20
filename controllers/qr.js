const express = require("express");
const QR = require("../models/qr");


// controllers/qrController.js



// Create QR Entry Controller
const createQrEntry = async (req, res) => {
  try {
    const { uniqueId, userData,imageDescription } = req.body;

    // Validate required fields
    if (!uniqueId || !userData) {
      return res.status(400).json({
        error: "uniqueId and userData are required fields.",
      });
    }

    const existing = await QR.findOne({ uniqueId });
    if (existing) {
      return res.status(400).json({ error: "Unique ID already exists" });
    }

    // Parse userData
    let parsedUserData;
    try {
      parsedUserData = typeof userData === "string" ? JSON.parse(userData) : userData;
    } catch (e) {
      return res.status(400).json({ error: "Invalid userData format. Must be valid JSON." });
    }

    // Clean image file names
   const imageUrls = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    
    // Create new QR entry
    const newQR = await QR.create({
      uniqueId,
      userData: parsedUserData,
      imageDescription,
      createdBy: req.user.id,
      imageUrls,
    });

    res.status(201).json({ message: "QR entry created successfully", data: newQR });
  } catch (error) {
    console.error("Error creating QR entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getEntry = async(req,res) => {
const { uniqueId } = req.params;

try {
  const qrEntry = await QR.findOne({ uniqueId });

    if (!qrEntry) {
      return res.status(404).json({ message: "QR entry not found" });
    }

if (typeof qrEntry.imageDescription === 'string') {
  try {
    qrEntry.imageDescription = JSON.parse(qrEntry.imageDescription);
  } catch (err) {
    console.error('Failed to parse imageDescription:', err);
    qrEntry.imageDescription = [];
  }
}

    // Update visit history with current timestamp
    qrEntry.visitedHistory.push({ visitedAt: new Date() });
    await qrEntry.save();

  res.render('entry', {
      qrEntry,
    });
  
} catch (error) {
  console.error("Error fetching QR entry:", error);
    res.status(500).json({ error: "Internal server error" });
}
}

const getAnalytics = async(req,res) => {
 const { uniqueId } = req.params;
 try {
  const qrEntry = await QR.findOne({ uniqueId });

  if (!qrEntry) {
    return res.status(404).json({ message: "QR entry not found" });
  }

  // Update visit history with current timestamp


  // Send JSON response
  res.json({
    success: true,
    qrId: qrEntry.uniqueId,
    data: {
      createdAt: qrEntry.createdAt,
      totalScans: qrEntry.visitedHistory.length,
      visitedHistory: qrEntry.visitedHistory,
      // add any other fields you want to send
    }
  });

} catch (error) {
  console.error("Error fetching QR entry:", error);
  res.status(500).json({ success: false, error: "Internal server error" });
}


}

const getAllEntries = async(req,res) => {
  try {
    
    const allEntries = await QR.find({createdBy: req.user.id}).sort({ createdAt: -1 });
    res.json({ allEntries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ message: "Server error while fetching entries" });
  }

}

const updateQrEntry = async (req, res) => {
  try {
    const { uniqueId, userData, imageDescription } = req.body;

    // Validate
    if (!uniqueId || !userData) {
      return res.status(400).json({ error: "uniqueId and userData are required." });
    }

    const existingQR = await QR.findOne({ uniqueId });
    if (!existingQR) {
      return res.status(404).json({ error: "QR entry not found." });
    }

    // Parse userData (handle string or array)
    let parsedUserData;
    try {
      parsedUserData = typeof userData === "string" ? JSON.parse(userData) : userData;
    } catch (e) {
      return res.status(400).json({ error: "Invalid userData format. Must be valid JSON." });
    }

    // Handle imageUrls from uploaded files (e.g., multer)
    const imageUrls = req.files?.map(file => `/uploads/${file.filename}`) || [];

    // Perform the update
    existingQR.userData = parsedUserData;
    existingQR.imageDescription = imageDescription;
    existingQR.imageUrls = imageUrls;
    existingQR.visitedHistory = []; // clear visit history
    existingQR.updatedAt = new Date(); // manually update timestamp

    await existingQR.save();

    res.status(200).json({ message: "QR entry updated successfully", data: existingQR });
  } catch (error) {
    console.error("Error updating QR entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createQrEntry,
  getEntry,
  getAnalytics,
  getAllEntries,
  updateQrEntry,
};
