const express = require("express");
const router = express.Router();
const { login, signup, RefreshToken } = require("../controllers/authentication");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/token").post(RefreshToken);


module.exports = router;
