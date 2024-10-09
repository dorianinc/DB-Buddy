const { ipcMain } = require("electron");
const { fetchDatabase } = require("../controllers/database");

const databaseIPC = () => {
  const res = {
    success: true,
    message: "",
    error: "",
    payload: null,
  };

  // get database data from file
  ipcMain.handle("get-database-data", async (_e, refresh = false) => {
    console.log("~~~~ Handling get-database-data ~~~~~");

    try {
      const database = await fetchDatabase(refresh);
      res.payload = database;
      return res;
    } catch (error) {
      console.error("error ==> ", error)
      handleError(error, "fetchDatabase");
    }
  });

  // set database status
  ipcMain.handle("set-database-status", async (_e, data) => {
    console.log("~~~~ Handling set-database-status ~~~~~");
  });
};
module.exports = databaseIPC;
