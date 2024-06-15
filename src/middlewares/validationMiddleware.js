const { check, validationResult } = require("express-validator");
const logger = require("../config/winston");

exports.validateCoverLetter = [
  check("url").not().isEmpty().withMessage("URL is required"),
  check("yourName").not().isEmpty().withMessage("Your name is required"),
  check("emailAddress")
    .isEmail()
    .withMessage("A valid email address is required"),
  check("phoneNumber").not().isEmpty().withMessage("Phone number is required"),
  check("employerName")
    .not()
    .isEmpty()
    .withMessage("Employer's name is required"),
  check("companyName").not().isEmpty().withMessage("Company name is required"),
  check("jobTitle").not().isEmpty().withMessage("Job title is required"),
  check("skills").not().isEmpty().withMessage("Skills are required"),
  check("projects").not().isEmpty().withMessage("Projects are required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(`Validation errors: ${errors.array()}`);
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateUserSignUp = [
  check("username").not().isEmpty().withMessage("Username is required"),
  check("email").not().isEmpty().withMessage("Email is required"),
  check("password").not().isEmpty().withMessage("Password is required"),
  (req, res, next) => {
    // if (process.env.NODE_ENV === "test") {
    //   return next();
    // }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(`Validation errors: ${JSON.stringify(errors.array())}`);
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateUserLogIn = [
  // check("username").not().isEmpty().withMessage("Username is required"),
  check("password").not().isEmpty().withMessage("Password is required"),
  (req, res, next) => {
    // if (process.env.NODE_ENV === "test") {
    //   return next();
    // }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(`Validation errors: ${JSON.stringify(errors.array())}`);
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

// body('username').isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
// body('email').isEmail().withMessage('Invalid email address'),
// body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
