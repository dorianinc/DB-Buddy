const { store } = require("../store");

const render = {
  baseUrl: "https://api.render.com/v1",
  databaseName: store.get("settings.dbName"),
  region: store.get("settings.region"),
  databaseKey: store.get("settings.dbKey"),
};

const options = {
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
    authorization: `Bearer ${store.get("settings.apiKey")}`,
  },
};

module.exports = { options, render };
