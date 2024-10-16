// Required modules and dependencies
const path = require("path"); // Module to work with file and directory paths
const { app, BrowserWindow, Menu, Tray } = require("electron"); // Electron components to manage app, windows, menus, and tray
const windowStateKeeper = require("electron-window-state"); // Manages the state (position, size) of the window between sessions
const { createTemplate } = require("./main/utils/Menu"); // Function that generates a menu template for the app
const { deployIPCListeners } = require("./main/ipc"); // Function to set up IPC (Inter-Process Communication) listeners
const { deployStoreListeners } = require("./main/store"); // Function to handle store-related events
const { handleAutoLaunch } = require("./main/utils/autoLaunch"); // Utility to manage auto-launch settings
const { store } = require("./main/store"); // Persistent storage for app settings and state

// Variables to store tray and dock icons
let trayIcon;
let dockIcon;

// Platform-specific icon paths
switch (process.platform) {
  case "win32": // Windows OS
    trayIcon = path.join(__dirname, "assets", "icons", "windows", "db-white.ico");
    dockIcon = trayIcon; // Same icon for both tray and dock
    break;
  case "darwin": // macOS
    trayIcon = path.join(__dirname, "assets", "icons", "mac", "db-white-tray.png");
    dockIcon = path.join(__dirname, "assets", "icons", "mac", "db-white.png"); // Different icons for tray and dock
    break;
  case "linux": // Linux OS
    trayIcon = path.join(__dirname, "assets", "icons", "linux", "db-white.png");
    dockIcon = trayIcon; // Same icon for tray and dock
    break;
  default: // Fallback to Linux icons if platform is unknown
    trayIcon = path.join(__dirname, "assets", "icons", "linux", "db-white.png");
    dockIcon = trayIcon;
    break;
}

// Check if the app is in development mode
const isDev = !app.isPackaged;
// Get auto-launch and minimized launch settings from store
const startLaunched = store.get("settings.autoLaunch");
const startMinimized = store.get("settings.launchMinimized");
const startHidden = startLaunched && startMinimized;
store.set("isHidden", startHidden);
// store.set("isExiting", false);


// Variables for window state and main window
let windowState;
let mainWindow;
let tray;

// Exit early if the app is launched by Electron Squirrel (used for installation events on Windows)
if (require("electron-squirrel-startup")) app.quit();

//---------------------- create windows ---------------------- //
function createMainWindow() {
  // Keep track of window position and size across sessions
  windowState = windowStateKeeper({
    defaultHeight: 675, // Default height of the window
    defaultWidth: 750,  // Default width of the window
  });

  // Create the main application window
  mainWindow = new BrowserWindow({
    x: windowState.x, // Last known x-coordinate of the window
    y: windowState.y, // Last known y-coordinate of the window
    height: windowState.height, // Restore previous height
    width: windowState.width, // Restore previous width
    resizable: false, // Disable resizing of the window
    show: false, // Hide window initially
    backgroundColor: "#212529", // Dark background color
    webPreferences: {
      preload: path.join(__dirname, "main", "preload.js"), // Preload script for context isolation
      contextIsolation: true, // Protects against prototype pollution attacks
      enableRemoteModule: false, // Disable remote module (for security)
      nodeIntegration: false, // Disable node.js integration (for security)
    },
    icon: dockIcon, // Set the window icon
  });

  const htmlPath = path.join(__dirname, "renderer", "views", "index.html"); // Path to the main HTML file to load
  windowState.manage(mainWindow); // Save window state on close
  mainWindow.loadFile(htmlPath); // Load the main HTML file
  if (isDev) mainWindow.webContents.openDevTools(); // Open DevTools in development mode

  deployIPCListeners(); // Set up inter-process communication listeners
  deployStoreListeners(mainWindow.webContents); // Set up store-related listeners

  setTray(app, mainWindow, startHidden); // Set up tray functionality

  // Handle window close event
  mainWindow.on("close", (e) => {
    // if (isDev) return;
    const isExiting = store.get("isExiting");
    console.log("🖥️  isExiting: ", isExiting)
    console.log("🖥️  mainWindow.isVisible(): ", mainWindow.isVisible())
    if (!isExiting && mainWindow.isVisible()) {
      console.log("preventing default behavior")
      e.preventDefault();
      mainWindow.hide();
    }
    console.log("closing window like normal")
  });

  // Handle window hide event
  mainWindow.on("hide", () => {
    console.log(" ----> hiding app")
    store.set("isHidden", true);
    setTray(app, mainWindow); // Pass 'true' to indicate the app is minimized
  });

  // Handle window show event
  mainWindow.on("show", () => {
    console.log(" ----> showing app")
    store.set("isHidden", false);
    store.set("isExiting", false);
    setTray(app, mainWindow); // Pass 'false' to indicate the app is restored
  });
  
  return mainWindow;
}

// macOS specific: Hide the dock icon and set the app name
if (process.platform === "darwin") {
  app.dock.hide(); // Hide dock icon on macOS
  app.setName("DB Buddy"); // Set app name
}

//---------------------- app initialization ---------------------- //

// When the app is ready, create the main window
app.whenReady().then(() => {
  const mainApp = createMainWindow(); // Create the main window
  mainApp.once("ready-to-show", () => {
    const autoLaunch = store.get("settings.autoLaunch"); // Get auto-launch setting
    const minimizeLaunch = store.get("settings.launchMinimized"); // Get minimized launch setting
    if (autoLaunch && minimizeLaunch) {
      mainApp.hide(); // Hide window if both settings are true
    } else {
      mainApp.show(); // Show window otherwise
    }
  });
});

handleAutoLaunch(); // Handle auto-launch settings

// Quit the app when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit(); // Quit app unless on macOS
  }
});

// On macOS, re-open the window if the dock icon is clicked and no windows are open
app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show(); // Show the main window
  }
});

//---------------------- helpers ---------------------- //

// Set Tray Icon and Menu
function setTray(app, mainWindow) {
  const template = createTemplate(app, mainWindow);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (!tray) {
    tray = new Tray(trayIcon); // Create a new tray icon if it doesn't exist
  }

  tray.setContextMenu(menu); // Set the tray's context menu
  if (process.platform === "win32") {
    // On Windows, clicking the tray icon shows and focuses the main window
    tray.on("click", () => {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      mainWindow.focus();
    });
  }
}
