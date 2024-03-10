const jwt = require("jsonwebtoken");
const httpStatusCodes = require("http-status-codes");

require("dotenv").config();

const Token = require("/models/token");

//token = "Bearer token-value"

const auth = async (req, res, next) => {
  const tokenInfo = req.headers.authorization.split(" ");
  if (tokenInfo[1] === "Bearer")
    return res
      .status(httpStatusCodes.FORBIDDEN)
      .json({ error: "Session information missing\nLogin again" });

  let token = tokenInfo[1];

  const validToken = jwt.verify(
    token,
    process.env.ACCESS_SECRET,
    async (err, data) => {
      if (err)
        return res
          .status(httpStatusCodes.FORBIDDEN)
          .json({ error: "Session expired" });

      const { username, _id, userType, fullName } = data;

      const tokenExists = await Token.findOne({ accessToken: token })
        .then((data) => {
          if (data === undefined || data == null)
            return res
              .status(httpStatusCodes.FORBIDDEN)
              .json({ error: "session id blocked" });

          req.user = { username, _id, userType, fullName };
          next();
        })
        .catch((err) => {
          return res
            .status(httpStatusCodes.NO_CONTENT)
            .json({ error: err.message });
        });
    }
  );
};
