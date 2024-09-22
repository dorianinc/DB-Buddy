require("dotenv").config();

const { ipcMain } = require("electron");
const { writeToFile } = require("../utils/helpers");

const authIPC = () => {
  //  Get login info

  ipcMain.handle("get-login-info", async (_e) => {
    console.log("~~~~ Handling get-login-info ~~~~~");
    try {
      const loginInfo = {
        credentials: process.env.CREDENTIALS || null,
        password: process.env.PASSWORD || null,
      };
      return loginInfo;
    } catch (error) {
      console.error("Error in get-login-info IPC handler:", error);
      throw error;
    }
  });

  ipcMain.handle("save-login-info", async (_e, data) => {
    console.log("~~~~ Handling save-login-info ~~~~~");
    try {
      await writeToFile(".env", data, "env");
    } catch (error) {
      console.error("Error in get-login-info IPC handler:", error);
      throw error;
    }
  });
};

module.exports = authIPC;
