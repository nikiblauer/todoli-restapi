const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const usersController = require("../controllers/users-controller");

router.get("/test", usersController.test);

router.post(
  "/signup",
  [check("email").isEmail(), check("password").not().isEmpty()],
  usersController.signup
);
router.post(
  "/login",
  [check("email").isEmail(), check("password").not().isEmpty()],
  usersController.login
);

module.exports = router;
