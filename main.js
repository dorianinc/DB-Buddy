const { app, BrowserWindow, Menu, Tray } = require("electron");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const deployIPCListeners = require("./ipc"); // Ensure this file exists and sets up IPC listeners

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
  });

  windowState.manage(mainWindow);
  mainWindow.loadFile("./views/index.html");
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  let wc = mainWindow.webContents

  console.log("all contents ===>", wc)
    wc.on('dom-ready', () => {
    console.log('DOM Ready')
  })

  return mainWindow;
};

const createSettingsModal = () => {
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
};

const openSettings = () => {
  const modal = createSettingsModal();
  const mainBounds = mainWindow.getBounds();
  const modalBounds = modal.getBounds();

  const modalX = Math.round(mainBounds.x + (mainBounds.width - modalBounds.width) / 2);
  const modalY = Math.round(mainBounds.y + (mainBounds.height - modalBounds.height) / 2);

  modal.setPosition(modalX, modalY);

  modal.once("ready-to-show", () => {
    modal.show();
  });
};

const setTray = (app, openSettings) => {
  const tray = new Tray(path.join(__dirname, "assets", "images", "react_icon.png"));
  const template = []; // Replace with your menu template
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  tray.setContextMenu(menu);
};

app.whenReady().then(() => {
  const mainApp = createMainWindow();
  deployIPCListeners(); // Ensure this sets up IPC listeners properly

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
