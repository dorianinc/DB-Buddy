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
      checkServiceStatus(services);
      res.payload = services;
      return res;
    } catch (error) {
      console.error("error in get-service-data: ", error);
      return {};
    }
  });
};

module.exports = serviceIPC;
