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
      handleError(error, "get settings IPC handler");
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
      console.error("Error in get-service-data IPC handler:", error);
      throw error;
    }
  });
};

const handleError = (error, functionName) => {
  const statusCode = error.response?.status;
  const errorMessage =
    error.response?.data?.message || "An unknown error occurred";

  console.error(
    `Error in ${functionName}: ${errorMessage} ${
      !statusCode ? "" : `Status code: ${statusCode}`
    }`
  );

  throw new Error(
    `Error in ${functionName}: ${errorMessage} ${
      !statusCode ? "" : `Status code: ${statusCode}`
    }`
  );
};

module.exports = settingsIPC;
