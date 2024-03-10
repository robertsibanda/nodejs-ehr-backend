const express = require("express");
const router = express.Router();
const { SearchPerson } = require("../controllers/basic");
const auth = require("../middleware/authentication");

router.route("/search").post(auth, SearchPerson);

module.exports = router;
