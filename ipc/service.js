const { ipcMain } = require("electron");
const { fetchRenderServices } = require("../utils/scraper");
const { writeToFile, readFromFile } = require("../utils/helpers");

const serviceIPC = () => {
  //  Get services from render
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  ipcMain.handle("get-service-data", async (_e, refresh = false) => {
    console.log("~~~~ Handling get-service-data ~~~~~");
    try {
      const localServices = !refresh && (await getLocalServices());
      const services = localServices || (await fetchRenderServices());

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

    async function getLocalServices() {
      try {
        const localData = await readFromFile("services.txt");
        const parsedData = JSON.parse(localData);

        if (parsedData && parsedData.database) {
          const { database, apps } = parsedData;
          const daysSinceLastDeploy = parseInt(
            database.lastDeployed.split(" ").shift(),
            10
          );

          if (daysSinceLastDeploy < 30 && Object.keys(apps).length > 0) {
            return parsedData;
          }
        }
        return null;
      } catch (error) {
        console.error("Error reading or parsing local data:", error);
        return null;
      }
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
