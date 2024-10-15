const path = require("path");
const { app, BrowserWindow, Menu, Tray } = require("electron");
const windowStateKeeper = require("electron-window-state");
const { createTemplate } = require("./main/utils/Menu");
const { deployIPCListeners } = require("./main/ipc");
const { deployStoreListeners } = require("./main/store");
const { handleAutoLaunch } = require("./main/utils/autoLaunch");
const { store } = require("./main/store");
const { updateElectronApp } = require("update-electron-app");

// Constants for icons based on platform
let trayIcon;
let dockIcon;

switch (process.platform) {
  case "win32":
    trayIcon = path.join(
      __dirname,
      "assets",
      "icons",
      "windows",
      "db-white.ico"
    );
    dockIcon = trayIcon;
    break;
  case "darwin":
    trayIcon = path.join(__dirname, "assets", "icons", "mac", "db-white-tray.png");
    dockIcon = path.join(__dirname, "assets", "icons", "mac", "db-white.png");
    break;
  case "linux":
    trayIcon = path.join(__dirname, "assets", "icons", "linux", "db-white.png");
    dockIcon = trayIcon;
    break;
  default:
    trayIcon = path.join(__dirname, "assets", "icons", "linux", "db-white.png");
    dockIcon = trayIcon;
    break;
}

const isDev = !app.isPackaged;
let windowState;
let mainWindow;
let tray;

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
    icon: dockIcon, // Set the window icon
  });

  const htmlPath = path.join(__dirname, "renderer", "views", "index.html");
  windowState.manage(mainWindow);
  mainWindow.loadFile(htmlPath);
  if (isDev) mainWindow.webContents.openDevTools();

  deployIPCListeners();
  deployStoreListeners(mainWindow.webContents);
  setTray(app, mainWindow);

  // Listen for window state changes
  mainWindow.on("minimize", () => {
    setTray(app, mainWindow, true); // Pass 'true' to indicate the app is minimized
  });

  mainWindow.on("restore", () => {
    setTray(app, mainWindow, false); // Pass 'false' to indicate the app is restored
  });

  return mainWindow;
}

// Set Dock Icon for macOS
if (process.platform === "darwin") {
  app.dock.setIcon(dockIcon);
  app.setName("DB Buddy");
}

//---------------------- app initialization ------------- //

app.whenReady().then(() => {
  // Initialize auto-updates
  updateElectronApp({
    repo: "dorianinc/db-buddy.git",
    updateInterval: "1 hour",
    logger: require("electron-log"),
  });

  const mainApp = createMainWindow();
  mainApp.once("ready-to-show", () => {
    const minimize = store.get("settings.autoLaunch");
    if (!isDev && minimize) {
      mainApp.minimize();
    } else {
      mainApp.show();
    }
  });
});
handleAutoLaunch();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//---------------------- helpers ------------- //

// Set Tray Icon and Menu
function setTray(app, mainWindow, isMinimized) {
  const template = createTemplate(app, mainWindow, isMinimized);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (!tray) {
    tray = new Tray(trayIcon);
  }

  tray.setContextMenu(menu);
}
