const store = require("../store/index");

// Settings --------------------------------------------------------------------------------------------

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
    console.log("🖥️  settings in get settings: ", settings);
    return settings;
  } catch (error) {
    console.error("error ==> ", error);
  }
};

const saveSettings = (settings) => {
  console.log("🖥️  settings: ", settings);
  console.log("🖥️  settings: ", settings);
};

function isEmpty(obj) {
  return Object.values(obj).length === 0;
}

module.exports = {
  getSettings,
  saveSettings,
};
