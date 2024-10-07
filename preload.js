const { contextBridge, ipcRenderer } = require("electron");

// invoke --> executes immediately and returns a promise with the result
// on --> sets up a listener that persists and waits for the event to trigger

contextBridge.exposeInMainWorld("api", {
  services: {
    getServices: async (refreshBool) =>
      ipcRenderer.invoke("get-service-data", refreshBool),
    getSingleService: async (data) =>
      ipcRenderer.invoke("get-single-service-data", data),
    saveEnv: async (data) => ipcRenderer.invoke("save-service-data", data),
    refreshService: (callback) => ipcRenderer.on("refresh-services", callback),
  },
  database: {
    getDatabase: async () => ipcRenderer.invoke("get-database-data"),
    saveDatabase: async (data) =>
      ipcRenderer.invoke("save-database-data", data),
  },
  auth: {
    getLoginInfo: async () => ipcRenderer.invoke("get-login-info"),
    saveLoginInfo: async (data) => ipcRenderer.invoke("save-login-info", data),
  },
  settings: {
    open: (callback) => ipcRenderer.on("open-settings", callback),
    getSettings: async () => ipcRenderer.invoke("get-settings-data"),
    saveSettings: async (data) => ipcRenderer.invoke("save-settings-data", data),
  },
});
