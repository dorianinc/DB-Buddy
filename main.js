const { app, BrowserWindow, Menu, Tray, ipcMain } = require("electron");
const { createTemplate } = require("./utils/Menu");
const path = require("path");
const dockIcon = path.join(__dirname, "assets", "images", "react_app_logo.png");
const trayIcon = path.join(__dirname, "assets", "images", "react_icon.png");
const windowStateKeeper = require("electron-window-state");
const deployIPCListeners = require("./ipc");
const serviceIPC = require("./ipc/service");

const isDev = !app.isPackaged;

let windowState;
let mainWindow;

if (require("electron-squirrel-startup")) app.quit();

const createMainWindow = () => {
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
    // alwaysOnTop: isDev ? true : false,
  });

  windowState.manage(mainWindow);
  mainWindow.loadFile("./views/index.html");
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
};

if (process.platform === "darwin") {
  app.dock.setIcon(dockIcon);
}
////////////////////////////////////////////////////////////////

const createSettingsModal = () => {
  const modal = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    height: 500,
    width: 400,
    autoHideMenuBar: true,
    alwaysOnTop: isDev ? true : false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  modal.loadFile("./views/settings.html");
  modal.webContents.openDevTools();

  return modal;
};

const openSettings = () => {
  const modal = createSettingsModal();
  const mainBounds = mainWindow.getBounds();
  const modalBounds = modal.getBounds();

  // Calculate the position to center the modal window within the main window
  const modalX = Math.round(
    mainBounds.x + (mainBounds.width - modalBounds.width) / 2
  );
  const modalY = Math.round(
    mainBounds.y + (mainBounds.height - modalBounds.height) / 2
  );

  // Set the position of the modal window
  modal.setPosition(modalX, modalY);

  modal.once("ready-to-show", () => {
    modal.show();
  });
};

const setTray = (app, openSettings) => {
  let tray = null;
  const template = createTemplate(app, openSettings);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  tray = new Tray(trayIcon);
  tray.setContextMenu(menu);
};

app.whenReady().then(() => {
  const mainApp = createMainWindow();
  deployIPCListeners();
  setTray(app, openSettings);

  mainApp.once("ready-to-show", () => {
    mainApp.show();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
