const { ipcMain } = require("electron");
const { getServices } = require("../utils/scraper");

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

  ipcMain.handle("greet", async (_e) => {
    console.log("~~~~ Handling get-service-data ~~~~~");
    return "hello world";
  });
};

module.exports = serviceIPC;
