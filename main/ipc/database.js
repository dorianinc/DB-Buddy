const { ipcMain } = require("electron");
const { fetchDatabase, checkDbStatus } = require("../controllers/database");
const { rebuildRender } = require("../controllers/rebuild");
const { differenceInDays } = require("date-fns");

const databaseIPC = () => {
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  // get database data from file
  ipcMain.handle("get-database-data", async (_e, refresh = false) => {
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

      res.payload = database;
      return res;
    } catch (error) {
      console.error("error in get-database-data: ", error);
      throw error;
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
module.exports = databaseIPC;
