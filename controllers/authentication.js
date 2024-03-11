const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config();

const User = require("../models/user");
const Token = require("../models/token");

const login = async (req, res) => {
  const { username, password } = req.body;

  console.log("from android : ", req.body);
  // request body has no credentials
  if (!username || !password)
    return res.json({ error: "username and password required" });

  //check if username and password finds a match from database
  await User.findOne({ username })
    .then(async (user) => {
      if (user === undefined || user === null)
        return res.json({ error: "wrong username/password" });

      const validUser = await bcrypt.compare(password, user.password);
      if (!validUser) return res.json({ error: "wrong username/password" });

      console.log("user  found");
      const { username, _id, userType, fullName } = user;
      req.user = { username, _id, userType, fullName };

      // generate tokens with user data
      await GenerateToken(req, res);
    })
    .catch((error) => {
      console.log(error);
      res.json({ error: error });
    });
};

const signup = async (req, res) => {
  const { username, password, contact, fullName } = req.body;

  // create user if username and email not already taken
  if (!username || !password || !contact || !fullName)
    return res.json({ error: "missing request data" });

  await User.findOne({ contact })
    .then(async (user) => {
      // email already registered
      if (user) return res.json({ error: "Email already registered" });

      await User.findOne({ username }).then(async (user) => {
        // username already taken
        if (user)
          // phone number already registered
          return res.json({ error: "Username already taken" });

        let hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
          username,
          fullName,
          contact,
          password: hashedPassword,
          userType: "unknown",
        }).then(async (user) => {
          req.user = { username, userType: "unknown", fullName };
          // generate tokens with user data
          return await GenerateToken(req, res);

          if (user) return res.json({ success: "user created" });
        });
      });
    })
    .catch((error) => {
      console.log("Error" + error);
      return res.json({ error: error.message });
    });
};

const RefreshToken = async (req, res) => {
  const { token } = req.body;
};

const GenerateToken = async (req, res, details) => {
  const ACCESS_TOKEN = jwt.sign(
    { user: req.user.username, userType: req.user.userType, id: req.user._id },
    process.env.ACCESS_SECRET,
    { expiresIn: "3d" }
  );

  const REFRESH_TOKEN = jwt.sign(
    { user: req.user.username, userType: req.user.userType },
    process.env.REFRESH_SECRET,
    { expiresIn: "10d" }
  );

  console.log("RE: ", req.user.username);

  await Token.findOne({ user: req.user.username })
    .then(async (tokenData) => {
      if (tokenData) {
        console.log("updating token");
        await Token.findOneAndUpdate(
          { user: req.user.username },
          { accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN }
        );
      } else {
        console.log("writing new token");
        await Token.create({
          user: req.user.username,
          accessToken: ACCESS_TOKEN,
          refreshToken: REFRESH_TOKEN,
        });
      }
      return res.json({
        success: "token generated",
        access: ACCESS_TOKEN,
        refresh: REFRESH_TOKEN,
        user: req.user.username,
        userType: req.user.userType,
        fullName: req.user.fullName,
      });
    })
    .catch((err) => {
      console.log(err);
      return resjson({ error: err });
    });
};

module.exports = {
  login,
  signup,
  RefreshToken,
};
