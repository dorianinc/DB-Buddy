const { store } = require("../store");

const getSettings = () => {
  try {
    const settings = store.get("settings");
    return settings;
  } catch (error) {
    console.error("Error in getSettings: ", error);
    return null;
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
