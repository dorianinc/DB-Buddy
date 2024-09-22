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

  //  Get single service from data
  ipcMain.handle("get-single-service-data", async (_e, data) => {
    console.log("~~~~ Handling get-service-data ~~~~~");
    try {
      const appName = data.toLowerCase();
      const services = await readFromFile(`${appName}.txt`);
      return services;
    } catch (error) {
      console.error("Error in get-service-data IPC handler:", error);
      throw error;
    }
  });

  // Save service data to file
  ipcMain.handle("save-service-data", async (_e, data) => {
    console.log("~~~~ Handling save-service-data ~~~~~");
    const appName = data.appName.toLowerCase();
    console.log("🖥️  appName: ", appName)
    console.log("🖥️  appName: ", appName)
    try {
      await writeToFile(`${appName}.txt`, data.env);
    } catch (error) {
      console.error("Error in save-service-data IPC handler:", error);
      throw error;
    }
  });
};

module.exports = serviceIPC;
