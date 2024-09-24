const { app, BrowserWindow, Menu, Tray } = require("electron");
const { createTemplate } = require("./utils/Menu");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const deployIPCListeners = require("./ipc");

const dockIcon = path.join(__dirname, "assets", "images", "react_app_logo.png");
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
    defaultHeight: 775,
    defaultWidth: 1315,
  });

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    height: windowState.height,
    width: windowState.width,
    backgroundColor: "#212529",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  windowState.manage(mainWindow);
  mainWindow.loadFile("./views/index.html");

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

// settings window creation
function createSettingsWindow() {
  const modal = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    height: 500,
    width: 400,
    autoHideMenuBar: true,
    alwaysOnTop: isDev,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  modal.loadFile("./views/settings.html");
  return modal;
}

// Set Dock Icon for macOS
if (process.platform === "darwin") {
  app.dock.setIcon(dockIcon);
}

//---------------------- helpers ------------- //

// Open Settings Modal and Center within Main Window
function openSettings() {
  const modal = createSettingsWindow();
  const mainBounds = mainWindow.getBounds();
  const modalBounds = modal.getBounds();

  // Center modal window within the main window
  const modalX = Math.round(
    mainBounds.x + (mainBounds.width - modalBounds.width) / 2
  );
  const modalY = Math.round(
    mainBounds.y + (mainBounds.height - modalBounds.height) / 2
  );

  modal.setPosition(modalX, modalY);

  modal.once("ready-to-show", () => {
    modal.show();
  });
}

// Set Tray Icon and Menu
function setTray(app, webContents, openSettings) {
  const template = createTemplate(app, webContents, openSettings);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  const tray = new Tray(trayIcon);
  tray.setContextMenu(menu);
}

//---------------------- app initialization ------------- //

app.whenReady().then(() => {
  const mainApp = createMainWindow();
  const webContents = mainApp.webContents;

  deployIPCListeners();
  setTray(app, webContents, openSettings);

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
