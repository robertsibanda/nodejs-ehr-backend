const express = require("express");

require("dotenv").config();

const database = require("./db/database");
const authRoutes = require("./routes/authentication.js");
const basicRoutes = require("./routes/basic.js");
const accountRoutes = require("./routes/account.js");

const app = express();
app.use(express.json());

app.use(function (req, res, next) {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Accept,Authorization,Origin"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use("/ehr/v1/auth/", authRoutes);
app.use("/ehr/v1/basic/", basicRoutes);
app.use("/ehr/v1/account/", accountRoutes);

app.set("port", process.env.PORT || 3000);

const server = app.listen(app.get("port"), async function () {
  await database(process.env.DATABASE_URI)
    .then(() => {
      console.log("Express server listening on port " + server.address().port);
    })
    .catch((ex) => {
      console.log("Error : ", ex.message);
      process.exit();
    });
});
