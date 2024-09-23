const { ipcMain } = require("electron");
const { getServices } = require("../utils/scraper");
const { writeToFile, readFromFile } = require("../utils/helpers");

const serviceIPC = () => {
  //  Get services from render
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  ipcMain.handle("get-service-data", async (_e) => {
    console.log("~~~~ Handling get-service-data ~~~~~");
    try {
      const services = await getServices();
      res.success = true;
      res.message = "Successfully pulled data from Render";
      res.payload = services;
      return res;
    } catch (error) {
      console.error("Error in get-service-data IPC handler:", error);
      res.success = false;
      res.error = error.message;
      return res;
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
    try {
      await writeToFile(`${appName}.txt`, data.env);
      res.success = true;
      res.message = "Successfully saved variables";
      return res;
    } catch (error) {
      console.error("Error in save-service-data IPC handler:", error);
      res.success = false;
      res.error = error.message;
      return res;
    }
  });
};

module.exports = serviceIPC;
