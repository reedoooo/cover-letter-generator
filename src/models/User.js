const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const coverLetterSchema = new mongoose.Schema(
  {
    name: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
); // Ensuring that no separate _id is created for subdocuments

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, trim: true, required: false },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: false,
  },
  password: { type: String, required: false },
  coverLetters: {
    type: Map,
    of: coverLetterSchema, // Use the defined coverLetterSchema for map values
    default: {},
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

// Pre-save hook for handling password hashing and updating timestamps
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (this.isModified("password")) {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (err) {
        return next(err);
      }
      this.password = hash;
      next();
    });
  } else {
    next();
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
