const { store } = require("../store");

const getSettings = () => {
  try {
    const settings = {
      dbName: null,
      dbKey: null,
      apiKey: null,
      region: null,
      autoUpdate: false,
      autoLaunch: false,
      launchMinimized: false
    };

    const storedSettings = store.get("settings");
    if (storedSettings) {
      Object.keys(storedSettings).forEach((key) => {
        settings[key] = storedSettings[key];
      });
    } 
    return settings;
  } catch (error) {
    console.error("Error in getSettings: ", error);
  }
};

const saveSettings = (settings) => {
  try {
    store.set("settings", settings);
  } catch (error) {
    console.error("Error in saveSettings: ", error);
    throw error;
  }
};

module.exports = {
  getSettings,
  saveSettings,
};
