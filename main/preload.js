const { contextBridge, ipcRenderer } = require("electron");

// invoke --> executes immediately and returns a promise with the result
// on --> sets up a listener that persists and waits for the event to trigger

contextBridge.exposeInMainWorld("api", {
  services: {
    getServices: async (refreshBool) =>
      ipcRenderer.invoke("get-service-data", refreshBool),
    setStatus: (callback) =>
      ipcRenderer.on("set-service-status", (_e, data) => callback(data)),
  },
  database: {
    getDatabase: async (refreshBool) =>
      ipcRenderer.invoke("fetch-database-data", refreshBool),
    setStatus: (callback) =>
      ipcRenderer.on("set-database-status", (_e, data) => callback(data)),
  },
  settings: {
    open: (callback) => ipcRenderer.on("open-settings", callback),
    getSettings: async () => ipcRenderer.invoke("get-settings-data"),
    saveSettings: async (data) =>
      ipcRenderer.invoke("save-settings-data", data),
  },
  app: {
    checkDaysRemaining: async (creationDate) =>
      ipcRenderer.invoke("check-days-remaining", creationDate),
    rebuildRender: async () => ipcRenderer.invoke("rebuild-render"),
    refreshApp: (callback) =>
      ipcRenderer.on("refresh-app", (_e, refreshBool) => callback(refreshBool)),
    reloadApp: (callback) =>
      ipcRenderer.on("reload-app", (_e, reloadBool) => callback(reloadBool)),
  },
});
