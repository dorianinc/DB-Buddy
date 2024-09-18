const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getServices: async () => ipcRenderer.invoke("get-service-data"),
  getLoginInfo: async () => ipcRenderer.invoke("get-login-info"),
  saveLoginInfo: async (data) => ipcRenderer.invoke("save-login-info", data),
  greet: async () => ipcRenderer.invoke("greet"),
});
