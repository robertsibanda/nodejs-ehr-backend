const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const httpStatusCodes = require("http-status-codes");

require("dotenv").config();

const User = require("../models/user");
const Token = require("../models/token");

const login = async (req, res) => {
  const { username, password } = req.body;

  // request body has no credentials
  if (!username || !password)
    return res.json({ error: "username and password required" });

  //check if username and password finds a match from database
  await User.findOne({ username })
    .then(async (user) => {
      if (user === undefined || user === null)
        return res
          .status(httpStatusCodes.NOT_FOUND)
          .json({ error: "user not found" });

      const validUser = await bcrypt.compare(password, user.password)
      if (!validUser)
        return res
            .status(httpStatusCodes.NOT_ACCEPTABLE)
            .json({error: "wrong credentials"});

      console.log("user  found");
      const { username, _id, userType, fullName } = user;
      req.user = { username, _id, userType, fullName };

      // generate tokens with user data
      GenerateToken(req, res);

    })
    .catch((error) => {
      console.log(error);
      res.status(httpStatusCodes.BAD_REQUEST).json({ error: error });
    });
};

const signup = async (req, res) => {
  const { username, password, email, fullName, phoneNumber } = req.body;

  // create user if username and email not already taken
  if (!username || !password || !email || !fullName || !phoneNumber)
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ error: "missing request data" });

  await User.findOne({ email }).then(async (user) => {
    // email already registered
    if (user)
      return res
        .status(httpStatusCodes.CONFLICT)
        .json({ error: "Email already registered" });

    await User.findOne({ username })
        .then(async (user) => {
      if (user)
        // username already taken
        return res
          .status(httpStatusCodes.CONFLICT)
          .json({ error: "Username already taken" });
      await User.findOne({ phoneNumber })
          .then(async (user) => {
        if (user)
          // phone number already registered
          return res
            .status(httpStatusCodes.CONFLICT)
            .json({ error: "Username already taken" });

        let hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
          username,
          fullName,
          phoneNumber,
          email,
          password: hashedPassword,
          userType: "unknown",
        })
            .then((user) => {
              if (user)
                return res
                    .status(httpStatusCodes.ACCEPTED)
                    .json({ success: "user created" });
            })
          });
    });
  })
    .catch((error) => {
      console.log("Error" + error);
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ error: error.message });
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
        console.log("updating token")
        await Token.findOneAndUpdate(
            { user: req.user.username },
            { accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN }
        )}
      else {
        console.log("writing new token")
        await Token.create(
            { user: req.user.username,
            accessToken: ACCESS_TOKEN,
            refreshToken: REFRESH_TOKEN})
      }
        return res.status(httpStatusCodes.OK).json({
          access: ACCESS_TOKEN,
          refresh: REFRESH_TOKEN,
          user: req.user.username,
          userType: req.user.userType,
          fullName: req.user.fullName,
        });
      })
    .catch((err) => {
      console.log(err)
      return res
        .status(httpStatusCodes.NO_CONTENT)
        .json({ error: err });
    });
};

module.exports = {
  login,
  signup,
  RefreshToken,
};
