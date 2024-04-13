const jwt = require("jsonwebtoken");

require("dotenv").config();

const Token = require("../models/token");

//token = "Bearer token-value"

const auth = async (req, res, next) => {
  //console.log("Header : ", req.headers);
  //console.log("Body : ", req.body);
  let tokenInfo = null;

  const { authorization } = req.body;

  if (authorization) tokenInfo = authorization.split(" ");
  else tokenInfo = req.headers.authorization.split(" ");

  if (tokenInfo[0] !== "Bearer")
    return res.json({ error: "Session information missing\nLogin again" });

  let token = tokenInfo[1];

  const validToken = jwt.verify(
    token,
    process.env.ACCESS_SECRET,
    async (err, data) => {
      if (err) return res.json({ error: "Session expired" });
      //console.log("Token verified : ", data);
      const { username, _id, userType, fullName } = data;

      const tokenExists = await Token.findOne({ accessToken: token })
        .then((data) => {
          if (data === undefined || data == null)
            return res.json({ error: "session id blocked" });

          req.user = { username, _id, userType, fullName };
          next();
        })
        .catch((err) => {
          return res.json({ error: err.message });
        });
    }
  );
};

module.exports = {
  auth,
};
