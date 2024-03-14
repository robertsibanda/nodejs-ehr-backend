const express = require("express");
const router = express.Router();
const {
	CreatePrescription,
	DeletePatient,
	AddPatient,
	CreateDiagnosis,
	ViewInformation,
	approve
} = require("../controllers/doctor");

const { auth } = require("../middleware/authentication");
const { notification } = require("../middleware/notification");

router.route("/approve").post(auth, approve);
router.route("/prescription").post(auth, CreatePrescription);
router.route("/diagnosis").post(auth, CreateDiagnosis);
router.route("/del-aptient").post(auth, DeletePatient);
router.route("/add-patient").post(auth, AddPatient);
router.route("/info").post(auth, ViewInformation);

module.exports = router;
