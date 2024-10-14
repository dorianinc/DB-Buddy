const { getSettings } = require("./settings");

const getConfigs = () => {
  const settings = getSettings();

  const render = {
    baseUrl: "https://api.render.com/v1",
    databaseName: settings.dbName,
    region: settings.region,
    databaseKey: settings.dbKey,
    autoUpdate: settings.autoUpdate,
    autoLaunch: settings.autoLaunch,
  };

  const options = {
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${settings.apiKey}`,
    },
  };

  return { render, options };
};

module.exports = { getConfigs };
