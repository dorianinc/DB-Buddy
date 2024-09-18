// const { ipcMain } = require("electron");
// const { readFromFile } = require("../utils/helpers");

// const generalIPC = () => {
//   //  Get login info

//   ipcMain.handle("get-login-info", async (_e) => {
//     console.log("~~~~ Handling get-login-info ~~~~~");
//     try {
//       const loginInfo = await readFromFile("login.txt");
//       return JSON.parse(loginInfo);;
//     } catch (error) {
//       console.error("Error in get-login-info IPC handler:", error);
//       throw error;
//     }
//   });

//   ipcMain.handle("save-login-info", async (_e) => {
//     console.log("~~~~ Handling save-login-info ~~~~~");
//     try {
//       const loginInfo = await readFromFile("login.txt");
//       return JSON.parse(loginInfo);;
//     } catch (error) {
//       console.error("Error in get-login-info IPC handler:", error);
//       throw error;
//     }
//   });
// };

// module.exports = generalIPC;
