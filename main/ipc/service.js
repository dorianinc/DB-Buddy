const { ipcMain } = require("electron");
const { fetchServices, checkServiceStatus } = require("../controllers/service");

const serviceIPC = () => {
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  ipcMain.handle("get-service-data", async (_e, refresh = false) => {
    try {
      const services = await fetchServices(refresh);
      res.payload = services;
      return res;
    } catch (error) {
      console.error("error: ", error);
      throw error;
    }
  });

  // //  Get services status
  // ipcMain.handle("get-service-status", async (_e, refresh = false) => {
  //   try {
  //     const statuses = await checkServiceStatus();
  //     res.payload = services;
  //     return res;
  //   } catch (error) {
  //     handleError(error, "fetchServices");
  //   }
  // });

  // // update service status
  // ipcMain.handle("set-service-status", async (_e, data) => {
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
