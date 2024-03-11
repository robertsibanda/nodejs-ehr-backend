const express = require("express");

const router = express.Router();

const { Update } = require("../controllers/account");
const { post } = require("./basic");
const { auth } = require("../middleware/authentication");

router.route("/update").post(auth, Update);

module.exports = router;
