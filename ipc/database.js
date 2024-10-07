const { ipcMain } = require("electron");
const { fetchDatabase } = require("../controllers/database");
const { writeToFile, readFromFile } = require("../utils/helpers");

const databaseIPC = () => {
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  // get database data from file
  ipcMain.handle("get-database-data", async (_e) => {
    console.log("~~~~ Handling get-database-data ~~~~~");

    try {
      const database = await fetchDatabase();
      res.payload = database;
      return res;
    } catch (error) {
      handleError(error, "fetchDatabase");
    }
  });

  // Save database data to file
  ipcMain.handle("save-database-data", async (_e, data) => {
    console.log("~~~~ Handling save-database-data ~~~~~");
    try {
      await writeToFile(`database.txt`, data, "json");
      res.success = true;
      res.message = "Successfully saved database data";
      return res;
    } catch (error) {
      console.error("Error in save-database-data IPC handler:", error);
      res.success = false;
      res.error = error.message;
      return res;
    }
  });
};
module.exports = databaseIPC;
