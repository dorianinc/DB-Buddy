const { ipcMain } = require("electron");
const { handleAutoLaunch } = require("../utils/autoLaunch");
const { getSettings, saveSettings } = require("../controllers/settings");

const settingsIPC = () => {
  //  Get settings from store
  ipcMain.handle("get-settings-data", async (_e) => {
    const res = {
      success: true,
      message: "",
      error: "",
      payload: null,
    };

    try {
      const settings = getSettings();
      res.payload = settings;
      return res;
    } catch (error) {
      console.error("error in get-settings-data: ", error);
      res.success = false; 
      res.error = "Failed to get settings.";
      return res;
    }
  });

  //  Save setting to store
  ipcMain.handle("save-settings-data", async (_e, data) => {
    const res = {
      success: true,
      message: "",
      error: "",
      payload: null,
    };

    try {
      saveSettings(data);
      handleAutoLaunch();
      res.message = "Settings saved successfully.";
      return res; 
    } catch (error) {
      console.error("error in save-settings-data: ", error);
      res.success = false; 
      res.error = "Failed to save settings.";
      return res;
    }
  });
};

module.exports = settingsIPC;
