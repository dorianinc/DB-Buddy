const { ipcMain } = require("electron");
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
      const db = {
        name: null,
        autoUpdate: false,
      };

      const localData = await readFromFile("database.txt");
      const parsedData = JSON.parse(localData);

      if (parsedData) {
        db.name = parsedData.name || null;
        db.autoUpdate = parsedData.autoUpdate || false;
      }

      res.success = true;
      res.message = "Successfully retrieved data";
      res.payload = db;
    } catch (error) {
      console.error("Error in get-database-data IPC handler:", error);
      res.message = "Failed to retrieve data";
      res.error = error.message;
    }

    return res;
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
