const httpStatusCodes = require("http-status-codes");

const User = require("../models/user");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

const ChangePermissions = async (req, res) => {
  // change user account permission
};

const ChangeAuthInformation = async (req, res) => {
  // change username, password or email address
};

const ViewAuthInformation = async (req, res) => {};

const Update = async (req, res) => {
  const { update, updateValue } = req.body;

  if (update === "user_type") {
    await User.findOneAndUpdate(
      { username: req.user.username },
      { userType: updateValue }
    ).then(async (user) => {
      if (updateValue === "doctor") {
        await Doctor.create({ username: req.user.username }).then((doc) => {
          res.json({ success: "account created" });
        });
      } else if (updateValue === "patient") {
        const { permissions } = req.body;
        await Patient.create({
          username: req.user.usernae,
          permissions: permissions,
        }).then((pat) => {
          res.json({ success: "account created" });
        });
      }
    });
  } else if (update === "profile_pic") {
    //  replace old image with new one
  } else if ((update = "proff")) {
    const { hospital, practice } = req.body;
    await Doctor.findOneAndUpdate(
      { username: req.user.username },
      { hospital, practice }
    ).then((pat) => {
      res.json({ success: "account created" });
    });
  }
};
