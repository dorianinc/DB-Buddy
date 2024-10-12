const { ipcMain } = require("electron");
const { getSettings, saveSettings } = require("../controllers/settings");

const settingsIPC = () => {
  //  Get settings store
  ipcMain.handle("get-settings-data", async (_e) => {
    const res = {
      success: true,
      message: "",
      error: "",
      payload: null,
    };

    try {
      const settings = getSettings();
      res.payload = settings; // Assign the settings to the payload
      return res;
    } catch (error) {
      console.error("error in get-settings-data: ", error);
      res.success = false; // Set success to false
      res.error = "Failed to get settings."; // Assign error message
      return res; // Return the response object
    }
  });

  //  Get single service data from file
  ipcMain.handle("save-settings-data", async (_e, data) => {
    const res = {
      success: true,
      message: "",
      error: "",
      payload: null,
    };

    try {
      saveSettings(data);
      res.message = "Settings saved successfully."; // Set success message
      return res; // Return the response object
    } catch (error) {
      console.error("error in save-settings-data: ", error);
      res.success = false; // Set success to false
      res.error = "Failed to save settings."; // Assign error message
      return res; // Return the response object
    }
  });
};

module.exports = settingsIPC;
