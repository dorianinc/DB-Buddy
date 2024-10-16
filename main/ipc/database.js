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

      return createSuccessfulResponse("Database fetched successfully", database);
    } catch (error) {
      console.error("error in fetch-database-data: ", error);
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
      statusCode: error.statusCode || 500,
      method: error.method || "Unknown",
    },
    payload: null,
  };
};

const createSuccessfulResponse = (message, payload = null) => {
  return {
    success: true,       
    message: message || "Operation completed successfully", 
    error: null,       
    payload: payload, 
  };
};

module.exports = databaseIPC;
