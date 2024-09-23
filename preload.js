const { contextBridge, ipcRenderer } = require("electron");

// // Renderer process
ipcRenderer.on('refresh-services-request', async (event, msg) => {
  console.log("Received request to refresh services");
  const response = await ipcRenderer.invoke("refresh-service-data");
  event.sender.send('refresh-services-response', response);
})

contextBridge.exposeInMainWorld("api", {
  getServices: async (refreshBool) => ipcRenderer.invoke("get-service-data", refreshBool),
  getSingleService: async (data) => ipcRenderer.invoke("get-single-service-data", data),
  refreshServices: async () => ipcRenderer.invoke("refresh-service-data"),
  getLoginInfo: async () => ipcRenderer.invoke("get-login-info"),
  saveLoginInfo: async (data) => ipcRenderer.invoke("save-login-info", data),
  saveEnv: async (data) => ipcRenderer.invoke("save-service-data", data),
  refreshService: (callback) => {
    ipcRenderer.on('refresh-services', (_e, data) => {
      callback(data);  
    });
  }
});
