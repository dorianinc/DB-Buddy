const { ipcMain } = require("electron");
const { fetchServices, checkServiceStatus } = require("../controllers/service");

const serviceIPC = () => {
  ipcMain.handle("get-service-data", async (_e, refresh = false) => {
    try {
      const services = await fetchServices(refresh);
      if (services) checkServiceStatus(services);
      
      return createSuccessfulResponse("Services fetched successfully", services);
    } catch (error) {
      console.error("error in get-service-data: ", error);
      return createErrorResponse(error);
    }
  });
};

// Utility function for error handling
const createErrorResponse = (error) => {
  return {
    success: false,
    message: "An error occurred while processing your request",
    error: {
      message: error.message || "Unknown error",
      statusCode: error.statusCode || 500, 
      method: error.method || "Unknown",
    },
    payload: null,
  };
};

// Utility function for success responses
const createSuccessfulResponse = (message, payload = null) => {
  return {
    success: true,      
    message: message || "Operation completed successfully",
    error: null,      
    payload: payload, 
  };
};

module.exports = serviceIPC;
