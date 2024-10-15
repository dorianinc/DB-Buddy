const path = require("path");
const { app, BrowserWindow, Menu, Tray } = require("electron");
const windowStateKeeper = require("electron-window-state");
const { createTemplate } = require("./main/utils/Menu");
const { deployIPCListeners } = require("./main/ipc");
const { deployStoreListeners } = require("./main/store");
const { handleAutoLaunch } = require("./main/utils/autoLaunch");
const { store } = require("./main/store");

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
    trayIcon = path.join(
      __dirname,
      "assets",
      "icons",
      "mac",
      "db-white-tray.png"
    );
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
const startLaunched = store.get("settings.autoLaunch");
const startMinimized = store.get("settings.launchMinimized");
const startHidden = startLaunched && startMinimized;

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
  setTray(app, mainWindow, startHidden);

  app.dock.hide();

  // Handle window close: hide instead of quitting
  mainWindow.on("close", (e) => {
    if (isDev) return;
    const isExiting = store.get("isExiting");
    if (!isExiting && mainWindow.isVisible()) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Listen for window state changes
  mainWindow.on("hide", () => {
    const isHidden = store.set("isHidden", true);
    setTray(app, mainWindow, isHidden); // Pass 'true' to indicate the app is minimized
  });

  mainWindow.on("show", () => {
    const isHidden = store.set("isHidden", false);
    setTray(app, mainWindow, isHidden); // Pass 'false' to indicate the app is restored
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
  const mainApp = createMainWindow();
  mainApp.once("ready-to-show", () => {
    const autoLaunch = store.get("settings.autoLaunch");
    const minimizeLaunch = store.get("settings.launchMinimized");

    if (autoLaunch && minimizeLaunch) {
      mainApp.hide();
    } else {
      mainApp.show();
    }
  });
});
handleAutoLaunch();

// Ensure the app quits when all windows are closed on non-macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Reopen the window when the dock icon is clicked (for macOS)
app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

//---------------------- helpers ------------- //

// Set Tray Icon and Menu
function setTray(app, mainWindow, isHidden) {
  const template = createTemplate(app, mainWindow, isHidden);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (!tray) {
    tray = new Tray(trayIcon);
  }

  tray.setContextMenu(menu);
}
