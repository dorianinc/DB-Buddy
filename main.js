const path = require("path");
const { createTemplate } = require("./utils/Menu");
const { app, BrowserWindow, Menu, Tray, webContents } = require("electron");
const windowStateKeeper = require("electron-window-state");
const deployIPCListeners = require("./ipc");
const store = require("./store");

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
    defaultHeight: 700,
    defaultWidth: 800,
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
  if (isDev) mainWindow.webContents.openDevTools();

  store.onDidChange('settings.region', (newValue, oldValue) => {
    const name = store.get("database.name")
    console.log(`Value changed from ${oldValue} to ${newValue}`);

    // Send the new value to the renderer process
    mainWindow.webContents.send('set-database-status', {name, status: newValue});
  });

  return mainWindow;
}

// Set Dock Icon for macOS
if (process.platform === "darwin") {
  app.dock.setIcon(dockIcon);
}

//---------------------- app initialization ------------- //

app.whenReady().then(() => {
  const mainApp = createMainWindow();
  const webContents = mainApp.webContents;

  deployIPCListeners();
  setTray(app, webContents);

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
