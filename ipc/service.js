const { ipcMain } = require("electron");
const { fetchServices } = require("../controllers/service");
const { writeToFile, readFromFile } = require("../utils/helpers");

const serviceIPC = () => {
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  //  Get services from render
  ipcMain.handle("get-service-data", async (_e, refresh = false) => {
    console.log("~~~~ Handling get-service-data ~~~~~");
    try {
      const services = await fetchServices(refresh);
      res.payload = services;
      return res;
    } catch (error) {
      handleError(error, "fetchServices");
    }
  });

  // set database status
  ipcMain.handle("set-service-status", async (_e, data) => {
    console.log("~~~~ Handling set-database-status ~~~~~");
    console.log("🖥️  data in controller: ", data);
  });

  // //  Get single service data from file
  // ipcMain.handle("get-single-service-data", async (_e, data) => {
  //   console.log("~~~~ Handling get-single-service-data ~~~~~");
  //   try {
  //     const appName = data.toLowerCase();
  //     const services = await readFromFile(`${appName}.txt`);
  //     res.success = true;
  //     res.message = "Successfully pulled data from Render";
  //     res.payload = { services };
  //     return res;
  //   } catch (error) {
  //     console.error("Error in get-service-data IPC handler:", error);
  //     throw error;
  //   }
  // });

  // // Save service data to file
  // ipcMain.handle("save-service-data", async (_e, data) => {
  //   console.log("~~~~ Handling save-service-data ~~~~~");
  //   const appName = data.appName.toLowerCase();
  //   try {
  //     await writeToFile(`${appName}.txt`, data.env);
  //     res.success = true;
  //     res.message = "Successfully saved variables";
  //     return res;
  //   } catch (error) {
  //     console.error("Error in save-service-data IPC handler:", error);
  //     res.success = false;
  //     res.error = error.message;
  //     return res;
  //   }
  // });
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

module.exports = serviceIPC;
