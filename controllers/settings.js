const store = require("../store/index");

// Settings --------------------------------------------------------------------------------------------
const res = {
  success: true,
  message: "",
  error: "",
  payload: null,
};

const getSettings = () => {
  try {
    const settings = {
      dbName: null,
      dbKey: null,
      apiKey: null,
      region: null,
    };
    const storedSettings = store.get("settings");
    if (storedSettings && !isEmpty(storedSettings)) {
      for (let key in storedSettings) {
        settings[key] = storedSettings[key] || null;
      }
    }
    return settings;
  } catch (error) {
    console.error("error ==> ", error);
  }
};

const saveSettings = (settings) => {
  try {
    store.set("settings", settings);
    res.success = true;
    res.message = "Successfully saved variables";
    return res;
  } catch (error) {
    console.error("error in saveSettings: ", error);
  }
};

function isEmpty(obj) {
  return Object.values(obj).length === 0;
}

module.exports = {
  getSettings,
  saveSettings,
};
