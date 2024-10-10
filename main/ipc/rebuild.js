const { ipcMain } = require("electron");
const { rebuildRender } = require("../controllers/rebuild");

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
};

module.exports = rebuildIPC;
