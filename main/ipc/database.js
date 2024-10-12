const { ipcMain } = require("electron");
const { fetchDatabase, checkDbStatus } = require("../controllers/database");
const { rebuildRender } = require("../controllers/rebuild");
const { differenceInDays } = require("date-fns");

const databaseIPC = () => {
  // fetch database data
  ipcMain.handle("fetch-database-data", async (_e, refresh = false) => {
    try {
      const database = await fetchDatabase(refresh);
      if (database) {
        const daysLeft = checkDaysRemaining(database.createdAt);
        if (daysLeft > 1) {
          checkDbStatus(database);
        } else {
          await rebuildRender();
        }
      }

      // Use the createSuccessfulResponse function to return a consistent response structure
      return createSuccessfulResponse("Database fetched successfully", database);
    } catch (error) {
      console.error("error in fetch-database-data: ", error);
      // Use createErrorResponse to return a standardized error response
      return createErrorResponse(error);
    }
  });
};

const checkDaysRemaining = (creationDate) => {
  const pastDate = new Date(creationDate);
  const currentDate = new Date();
  const daysDifference = differenceInDays(currentDate, pastDate);
  const daysLeft = 30 - daysDifference;

  return daysLeft;
};

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

const createSuccessfulResponse = (message, payload = null) => {
  return {
    success: true,       // Indicates the operation was successful
    message: message || "Operation completed successfully", // Custom or default success message
    error: null,         // No error in successful responses
    payload: payload,    // The actual data returned, defaulting to null if not provided
  };
};

module.exports = databaseIPC;
