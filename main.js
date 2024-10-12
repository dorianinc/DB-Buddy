const path = require("path");
const { createTemplate } = require("./main/utils/Menu");
const { app, BrowserWindow, Menu, Tray } = require("electron");
const windowStateKeeper = require("electron-window-state");
const { deployIPCListeners } = require("./main/ipc");
const { deployStoreListeners } = require("./main/store");
const { handleAutoLaunch } = require("./main/utils/autoLaunch");

const dockIcon = path.join(__dirname, "assets", "images", "db-white.png");
const trayIcon = path.join(__dirname, "assets", "images", "react_icon.png");

const isDev = !app.isPackaged;
let windowState;
let mainWindow;

// Exit if Electron Squirrel startup
if (require("electron-squirrel-startup")) app.quit();

//---------------------- create windows ------------- //

// Main Window Creation
function createMainWindow() {
  windowState = windowStateKeeper({
    defaultHeight: 675,
    defaultWidth: 750,
  });

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    height: windowState.height,
    width: windowState.width,
    resizable: false,
    show: false,
    backgroundColor: "#212529",
    webPreferences: {
      preload: path.join(__dirname, "main", "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  const hmtlPath = path.join(__dirname, "renderer", "views", "index.html");
  windowState.manage(mainWindow);
  mainWindow.loadFile(hmtlPath);
  if (isDev) mainWindow.webContents.openDevTools();

  deployIPCListeners();
  deployStoreListeners(mainWindow.webContents);
  setTray(app, mainWindow.webContents);

  return mainWindow;
}

// Set Dock Icon for macOS
if (process.platform === "darwin") {
  app.dock.setIcon(dockIcon);
  // Set app name for macOS menu bar
  app.setName("DB Buddy");
}

//---------------------- app initialization ------------- //

app.whenReady().then(() => {
  const mainApp = createMainWindow();
  mainApp.once("ready-to-show", () => {
    mainApp.show();
  });
});
handleAutoLaunch();

// Quit the app when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//---------------------- helpers ------------- //

// Set Tray Icon and Menu
function setTray(app, webContents) {
  const template = createTemplate(app, webContents);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  const tray = new Tray(trayIcon);
  tray.setContextMenu(menu);
}
