const express = require("express");
const router = express.Router();
const {
  AddDoctor,
  DeleteAppointment,
  DeleteDoctor,
  CreateAppointment,
  EditAppointment,
  ViewInformation,
} = require("../controllers/patient");

const { auth } = require("../middleware/authentication");
const { notification } = require("../middleware/notification");

router.route("/add-doc").post(auth, AddDoctor);
router.route("/del-doc").post(auth, DeleteDoctor);
router.route("/add-event").post(auth, CreateAppointment);
router.route("/del-event").post(auth, DeleteAppointment);
router.route("/view").post(auth, ViewInformation);

module.exports = router;
