const express = require("express");
const router = express.Router();
const {
  SearchPerson,
  ViewProfileInformation,
} = require("../controllers/basic");
const { auth } = require("../middleware/authentication");

router.route("/search").post(auth, SearchPerson);
router.route("/profile").post(auth, ViewProfileInformation);

module.exports = router;
