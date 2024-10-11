const { ipcMain } = require("electron");
const { getSettings, saveSettings } = require("../controllers/settings");

const settingsIPC = () => {
  //  Get settings store
  ipcMain.handle("get-settings-data", async (_e) => {
    try {
      const settings = getSettings();
      return settings;
    } catch (error) {
      console.error("error in get-settings-data: ", error);
      throw error;
    }
  });

  //  Get single service data from file
  ipcMain.handle("save-settings-data", async (_e, data) => {
    try {
      saveSettings(data);
    } catch (error) {
      console.error("error in get-service-data", error);
      res.error = "Failed to save settings.";
      throw error;
    }
  });
};

module.exports = settingsIPC;
