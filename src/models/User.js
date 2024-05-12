const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: { type: String, unique: true, trim: true },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String },
  coverLetters: {
    type: Map,
    of: new Schema(
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
    ),
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

// Pre-save hook to handle the updatedAt field automatically and hash password if modified
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (this.isModified("password")) {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model("User", userSchema);
