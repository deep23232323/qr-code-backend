const mongoose = require("mongoose");

const userEntrySchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true,
  },

  userData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },

  imageUrls: {
    type: [String],
    default: [],
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageDescription: {
     type: mongoose.Schema.Types.Mixed,

  },
 visitedHistory: [
  {
    visitedAt: {
      type: Date,
      default: Date.now,
    },
  }
],
}, { timestamps: true });

const User = mongoose.model("userEntry", userEntrySchema);

module.exports = User;
