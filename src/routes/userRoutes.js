const express = require("express");
const router = express.Router();
const validationMiddleware = require("../middlewares/validationMiddleware");
const userController = require("../controllers/userController");

router.post(
  "/signup",
  validationMiddleware.validateUserSignUp,
  userController.registerUser,
);
router.post(
  "/login",
  validationMiddleware.validateUserLogIn,
  userController.loginUser,
);
router.post("/logout", userController.logoutUser);
router.get("/validate-token", userController.validateToken);

module.exports = router;
