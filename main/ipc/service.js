const { ipcMain } = require("electron");
const { fetchServices, checkServiceStatus } = require("../controllers/service");

const serviceIPC = () => {
  ipcMain.handle("get-service-data", async (_e, refresh = false) => {
    try {
      const services = await fetchServices(refresh);
      if (services) checkServiceStatus(services);
      
      // Use createSuccessfulResponse to return a standardized success response
      return createSuccessfulResponse("Services fetched successfully", services);
    } catch (error) {
      console.error("error in get-service-data: ", error);
      // Use createErrorResponse to return a standardized error response
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
      statusCode: error.statusCode || 500, // Default to 500 if no status is provided
      method: error.method || "Unknown",
    },
    payload: null,
  };
};

// Utility function for success responses
const createSuccessfulResponse = (message, payload = null) => {
  return {
    success: true,       // Indicates the operation was successful
    message: message || "Operation completed successfully", // Custom or default success message
    error: null,         // No error in successful responses
    payload: payload,    // The actual data returned, defaulting to null if not provided
  };
};

module.exports = serviceIPC;
