const { ipcMain } = require("electron");
const { getSettings, saveSettings } = require("../controllers/settings");

const settingsIPC = () => {
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  //  Get settings store
  ipcMain.handle("get-settings-data", async (_e) => {
    try {
      const settings = getSettings();
      res.success = true;
      res.message = "Successfully got settings data";
      res.payload = settings;
      return res;
    } catch (error) {
      console.error("error in get-settings-data: ", error);
      res.error = "Failed to retrieve settings.";
      return res;
    }
  });

  //  Get single service data from file
  ipcMain.handle("save-settings-data", async (_e, data) => {
    try {
      saveSettings(data)
      res.success = true;
      res.message = "Successfully saved settings data";
      return res;
    } catch (error) {
      console.error("error in get-service-data", error);
      res.error = "Failed to save settings.";
      return res;
    }
  });
};


module.exports = settingsIPC;
