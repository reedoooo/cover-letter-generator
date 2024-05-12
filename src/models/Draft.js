const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const coverLetterSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Assuming there is a User model to reference
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Add a pre-save hook to handle the updatedAt field automatically
coverLetterSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("CoverLetter", coverLetterSchema);
