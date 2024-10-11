const { store } = require("../store");

const getSettings = () => {
  const res = { success: false, message: "", error: "", payload: null };

  try {
    const settings = {
      dbName: null,
      dbKey: null,
      apiKey: null,
      region: null,
    };

    const storedSettings = store.get("settings");
    if(storedSettings){
      Object.keys(storedSettings).forEach((key) => {
        settings[key] = storedSettings[key] || null;
      });
    }

    res.success = true;
    res.message = "Settings retrieved successfully.";
    res.payload = settings;
    return res;
  } catch (error) {
    console.error("Error in getSettings: ", error);
    res.error = "Failed to retrieve settings.";
    return res;
  }
};

const saveSettings = (settings) => {
  const res = { success: false, message: "", error: "", payload: null };

  try {
    store.set("settings", settings);
    res.success = true;
    res.message = "Successfully saved settings.";
    return res;
  } catch (error) {
    console.error("Error in saveSettings: ", error);
    res.error = "Failed to save settings.";
    return res;
  }
};

module.exports = {
  getSettings,
  saveSettings,
};
