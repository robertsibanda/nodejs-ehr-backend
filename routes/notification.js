const express = require("express");
const router = express.Router();
const { get, read } = require("../controllers/notification");
const { auth } = require("../middleware/authentication");

router.route("/").post(auth, get);

module.exports = router;
