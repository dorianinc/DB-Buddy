const path = require("path");
const { createTemplate } = require("./utils/Menu");
const { app, BrowserWindow, Menu, Tray } = require("electron");
const windowStateKeeper = require("electron-window-state");
const deployIPCListeners = require("./ipc");
const { deployStoreListeners } = require("./store");
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Increase the limit globally
emitter.setMaxListeners(15);

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
    defaultHeight: 600,
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
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  windowState.manage(mainWindow);
  mainWindow.loadFile("./views/index.html");
  if (isDev) mainWindow.webContents.openDevTools();

  deployIPCListeners();
  deployStoreListeners(mainWindow.webContents);
  setTray(app, mainWindow.webContents);

  return mainWindow;
}

// Set Dock Icon for macOS
// Set Dock Icon for macOS
if (process.platform === "darwin") {
  app.dock.setIcon(dockIcon);
  // Set app name for macOS menu bar
  app.setName("DB Buddy"); // Replace "MyAppName" with your actual app name
}

//---------------------- app initialization ------------- //

app.whenReady().then(() => {
  const mainApp = createMainWindow();
  mainApp.once("ready-to-show", () => {
    mainApp.show();
  });
});

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
