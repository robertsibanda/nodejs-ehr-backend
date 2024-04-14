const express = require("express");
const router = express.Router();
const {
  SearchPerson,
  ViewProfileInformation,
  GetAppointments,
  DeleteAppointment,
} = require("../controllers/basic");
const { auth } = require("../middleware/authentication");

router.route("/search").post(auth, SearchPerson);
router.route("/appointments").post(auth, GetAppointments);
router.route("/del-appointments").post(auth, DeleteAppointment);
router.route("/profile").post(auth, ViewProfileInformation);

module.exports = router;
