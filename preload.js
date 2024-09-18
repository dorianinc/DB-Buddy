const { contextBridge, ipcRenderer } = require("electron");

console.log("IN THE PRELOAD FILE -----------------------------");
contextBridge.exposeInMainWorld("api", {
  getServices: async () => ipcRenderer.invoke("get-service-data"),
  getLoginInfo: async () => ipcRenderer.invoke("get-login-info"),
  saveLoginInfo: async () => ipcRenderer.invoke("save-login-info"),
  greet: async () => ipcRenderer.invoke("greet"),
});
