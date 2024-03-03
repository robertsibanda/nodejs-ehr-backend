const mongoose = require("mongoose");

const Database = (URL) => {
    return mongoose
        .connect(URL)
        .then(() => {
            console.log("DATABASE CONNECTED");
        })
        .catch((err) => {
            console.log(`Error connecting to database : ${err}`);
            process.exit(1)
        });
};

module.exports = Database;
