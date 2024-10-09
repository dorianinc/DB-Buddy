const { ipcMain } = require("electron");
const { rebuildRender } = require("../controllers/rebuild");

const rebuildIPC = () => {
  //  Get login info
  ipcMain.handle("rebuild-render", async (_e) => {
    console.log("~~~~ Handling rebuild-render ~~~~~");
    try {
      await rebuildRender();
    } catch (error) {
      console.error("Error in rebuild-render IPC handler:", error);
      throw error;
    }
  });
};

module.exports = rebuildIPC;
// dpg-cs30hphu0jms7391p970-a
// dpg-cruv0atds78s73a59uf0-a