const { ipcMain } = require("electron");
const { rebuildRender, checkDaysRemaining } = require("../controllers/rebuild");

const rebuildIPC = () => {
  //  Trigger rebuild
  ipcMain.handle("rebuild-render", async (_e) => {
    try {
      await rebuildRender();
    } catch (error) {
      console.error("Error in rebuild-render IPC handler:", error);
      throw error;
    }
  });

  //  Check how many days the current database has left
  ipcMain.handle("check-days-remaining", async (_e, creationDate) => {
    try {
      checkDaysRemaining(creationDate);
    } catch (error) {
      console.error("Error in rebuild-render IPC handler:", {
        status: error.status,
        nessage: error.data.message,
      });
      throw error;
    }
  });
};

module.exports = rebuildIPC;
