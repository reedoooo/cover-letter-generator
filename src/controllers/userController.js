const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../config/winston');
const { default: mongoose } = require('mongoose');
const { userPrompts, systemAssistantPrompts } = require('../utils/openAiUtilities');

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      coverLetters: [],
      storage: {
        templates: {
          assistants: [
            'UX/UI Developer',
            'Data Analyst',
            'Software Developer',
            'Senior Frontend Developer',
            'Senior Backend Developer',
            'Senior Full Stack Developer',
            'Full Stack Developer',
            'Backend Developer',
            'Frontend Developer',
          ],
          prompts: Object.keys(userPrompts),
          customAiTemplates: [],
        },
        prompts: Object.keys(systemAssistantPrompts).map(generatorTitle => ({
          generatorTitle,
          data: {},
        })),
      },
      dashboard: {
        projects: new Map(),
      },
      profile: {
        img: '',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    logger.info(`User registered: ${user.username}`);
    res.status(201).json({
      token,
      userId: user._id,
      user: user,
      message: 'User registered successfully',
    });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const query = usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const passwordMatch = bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    // req.session.user = { id: user._id, username: user.username };
    logger.info(`User logged in: ${user.email}`);
    res.status(200).json({
      token,
      userId: user._id,
      user: user,
      message: 'Logged in successfully',
    });
  } catch (error) {
    logger.error(`Error logging in: ${error.message}`);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
exports.logoutUser = async (req, res) => {
  try {
    if (req.token) {
      logger.info(`User logged out: ${req.token.username}`);
      delete req.token;
    } else {
      logger.info(`No user logged out : ${JSON.stringify(req.token)}`);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Error logging out: ${error.message}`);
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};
exports.validateToken = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('No token provided');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid token');
    }
    res.send('Token is valid');
  });
};
exports.getPromptLibrary = async (req, res) => {
  try {
    const objectId = await mongoose.Types.ObjectId.createFromHexString(req.body.userId);

    const user = await User.findById(objectId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const prompts = user.storage.prompts;
    res.status(200).json({
      status: 'success',
      data: prompts,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching prompts' });
  }
};
