require("dotenv").config();
const { store } = require("../store");

const key = store.get("settings.apiKey"); 

const options = {
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    authorization: `Bearer ${key}`,
  },
};

module.exports = options;