const { ipcMain } = require("electron");
const { getServices } = require("../utils/scraper");
const { writeToFile, readFromFile } = require("../utils/helpers");

const serviceIPC = () => {
  //  Get services from render
  ipcMain.handle("get-service-data", async (_e) => {
    console.log("~~~~ Handling get-service-data ~~~~~");
    try {
      const services = await getServices();
      return services;
    } catch (error) {
      console.error("Error in get-service-data IPC handler:", error);
      throw error;
    }
  });

  ipcMain.handle("save-service-env", async (_e, data) => {
    console.log("~~~~ Handling save-service-data ~~~~~");
    console.log("🖥️  data.appName: ", data.appName);
    console.log("🖥️  data.env: ", data.env);
    try {
      await writeToFile(`${data.appName}.env`, data.env);
    } catch (error) {
      console.error("Error in save-service-data IPC handler:", error);
      throw error;
    }
  });
};

module.exports = serviceIPC;
