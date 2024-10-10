const { store } = require("../store");

const options = {
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    authorization: `Bearer ${store.get("settings.apiKey")}`,
  },
};

module.exports = options;