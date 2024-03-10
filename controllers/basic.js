const httpStatusCodes = require("http-status-codes");

const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const User = require("../models/user");

const SearchPerson = async (req, res) => {
  const { search_string, user_type } = req.body;
  await User.find({ userType: user_type }).then(async (people) => {
    foundPeople = people.filter((person) => {
      if (person.fullName.toLowerCase().includes(search_string.toLowerCase())) {
        return person;
      }
    });

    if (foundPeople.length > 0) {
      res.json({ people: foundPeople });
    } else {
      res.json({ error: "404" });
    }
  });
};

module.exports = {
  SearchPerson,
};
