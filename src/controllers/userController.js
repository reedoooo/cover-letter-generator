const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const logger = require("../config/winston");

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      coverLetters: new Map(),
      createdAt: new Date(),
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // req.session.user = { id: user._id, username: user.username };
    logger.info(`User registered: ${user.username}`);
    res.status(201).json({
      token,
      userId: user._id,
      user: user,
      message: "User registered successfully",
    });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // req.session.user = { id: user._id, username: user.username };
    logger.info(`User logged in: ${user.username}`);
    res.status(200).json({
      token,
      userId: user._id,
      user: user,
      message: "Logged in successfully",
    });
  } catch (error) {
    logger.error(`Error logging in: ${error.message}`);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
exports.logoutUser = async (req, res) => {
  try {
    // if (req.session) {
    //   req.session.destroy();
    // }
    req.token = null;
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error(`Error logging out: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
};
exports.validateToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("No token provided");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token");
    }
    res.send("Token is valid");
  });
};
