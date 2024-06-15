const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Template } = require('./Template');

// Define the cover letter schema
const coverLetterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  content: {
    type: Object,
    required: false,
  },
});
// Define the prompt schema
const promptSchema = new mongoose.Schema({
  generatorTitle: {
    type: String,
    enum: [
      'coverLetter',
      'chat',
      'generateNewComponent',
      'reviseComponent',
      'uxUiDeveloper',
      'promptEnhancerAi',
      'softwareDeveloper',
      'textBasedWebBrowser',
      'seniorFrontendDeveloper',
      'commitMessageGenerator',
      'graphvizDotGenerator',
      'chatGptPromptGenerator',
      'dataAnalyst',
      'seoAdvisor',
      'recipeCreator',
      'createTemplatePrompt',
      'reviseTemplatePrompt',
    ],
    required: true,
  },
  data: {
    type: Map,
    of: String,
    required: true,
  },
});
// Define the user schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, trim: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  coverLetters: [coverLetterSchema],
  storage: {
    templates: {
      assistants: [
        {
          type: String,
          enum: [
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
        },
      ],
      prompts: [String],
      customAiTemplates: [Template.schema],
    },
    prompts: [promptSchema],
  },
  dashboard: {
    projects: Map,
  },
  profile: {
    img: String,
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

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.isModified('password')) {
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

const User = mongoose.model('User', userSchema);

module.exports = User;
