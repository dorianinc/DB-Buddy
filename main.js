// Required modules and dependencies
const path = require("path"); // Module to work with file and directory paths
const { app, BrowserWindow, Menu, Tray } = require("electron"); // Electron components to manage app, windows, menus, and tray icons
const windowStateKeeper = require("electron-window-state"); // Keeps track of window state (size, position) across app sessions
const { createWindowMenuTemplate } = require("./main/utils/Menu"); // Function to generate the window menu template
const { createTrayMenuTemplate } = require("./main/utils/Menu"); // Function to generate the tray menu template
const { deployIPCListeners } = require("./main/ipc"); // Sets up Inter-Process Communication (IPC) listeners for communication between processes
const { deployStoreListeners } = require("./main/store"); // Sets up listeners for handling store events (persistent storage)
const { handleAutoLaunch } = require("./main/utils/autoLaunch"); // Manages auto-launch functionality
const { store } = require("./main/store"); // Persistent storage for app settings and state

// Variables to store tray and dock icons, based on the platform (Windows, macOS, or Linux)
let trayIcon;
let dockIcon;

// Platform-specific icon paths for tray and dock icons
switch (process.platform) {
  case "win32": // For Windows OS
    trayIcon = path.join(
      __dirname,
      "assets",
      "icons",
      "windows",
      "db-white.ico"
    );
    dockIcon = trayIcon; // Use the same icon for both tray and dock
    break;
  case "darwin": // For macOS
    trayIcon = path.join(
      __dirname,
      "assets",
      "icons",
      "mac",
      "db-white-tray.png"
    );
    dockIcon = path.join(__dirname, "assets", "icons", "mac", "db-white.png"); // Different icons for tray and dock
    break;
  case "linux": // For Linux OS
    trayIcon = path.join(__dirname, "assets", "icons", "linux", "db-white.png");
    dockIcon = trayIcon; // Same icon for both tray and dock
    break;
  default: // Fallback if platform is unknown
    trayIcon = path.join(__dirname, "assets", "icons", "linux", "db-white.png");
    dockIcon = trayIcon;
    break;
}

// Flag to check if the app is in development mode (true if the app is not packaged)
const isDev = !app.isPackaged;

// Variables for window state management, main window, and tray icon
let windowState;
let mainWindow;
let tray;

// Exit early if the app is launched by Electron Squirrel (used for installation events on Windows)
if (require("electron-squirrel-startup")) app.quit();

//---------------------- create windows ---------------------- //

// Function to create the main application window
function createMainWindow() {
  // Track window position and size across sessions using windowStateKeeper
  windowState = windowStateKeeper({
    defaultHeight: 675, // Default window height
    defaultWidth: 750, // Default window width
  });

  // Create the main window using Electron's BrowserWindow API
  mainWindow = new BrowserWindow({
    x: windowState.x, // Restores last known x-coordinate
    y: windowState.y, // Restores last known y-coordinate
    height: windowState.height, // Restores last known height
    width: windowState.width, // Restores last known width
    resizable: false, // Disable resizing of the window
    show: false, // Initially hide the window until ready
    backgroundColor: "#212529", // Set a dark background color
    webPreferences: {
      preload: path.join(__dirname, "main", "preload.js"), // Preload script for extra security (sandboxing)
      contextIsolation: true, // Ensure isolation between main process and renderer for security
      enableRemoteModule: false, // Disable remote module for security reasons
      nodeIntegration: false, // Prevent node.js access in the renderer process
    },
    icon: dockIcon, // Set the dock icon for macOS or tray icon for Windows/Linux
  });

  const htmlPath = path.join(__dirname, "renderer", "views", "index.html"); // Path to the main HTML file for the app interface
  windowState.manage(mainWindow); // Manage and save window state (position and size)
  mainWindow.loadFile(htmlPath); // Load the main HTML file into the window

  // Open Developer Tools automatically if in development mode
  if (isDev) mainWindow.webContents.openDevTools();

  deployIPCListeners(); // Set up IPC listeners for inter-process communication
  deployStoreListeners(mainWindow.webContents); // Set up listeners for store events, using the window's web contents

  // Handle the 'close' event of the window
  mainWindow.on("close", (e) => {
    const isExiting = store.get("isExiting"); // Check if the app is actually exiting
    const isVisible = mainWindow.isVisible(); // Check if the main window is visible

    // If the app is exiting, allow the window to close
    if (isExiting) {
      return; // Do nothing and allow the window to close
    }

    // If the window is visible and not exiting, prevent closing and hide instead
    if (isVisible) {
      e.preventDefault(); // Prevent default behavior (closing)
      mainWindow.hide(); // Hide the window
    }
  });

  // Handle when the window is hidden
  mainWindow.on("hide", () => {
    store.set("isHidden", true); // Update store to reflect hidden state
    setTray(app, mainWindow); // Update tray with hidden state
  });

  // Handle when the window is shown
  mainWindow.on("show", () => {
    store.set("isHidden", false); // Update store to reflect visible state
    setTray(app, mainWindow); // Update tray with visible state
  });

  return mainWindow; // Return the created window
}

// macOS-specific behavior to hide the dock icon and set the app name
if (process.platform === "darwin") {
  app.dock.setIcon(dockIcon)
  app.setName("DB Buddy"); // Set the app name
}

//---------------------- app initialization ---------------------- //

// When the app is ready, create the main window and manage its behavior
app.whenReady().then(() => {
  const mainApp = createMainWindow(); // Create the main window

  // Set isExiting to false at the start of the session
  store.set("isExiting", false); // Reset exit flag to false

  mainApp.once("ready-to-show", () => {
    // Retrieve launch settings from persistent store
    const startLaunched = store.get("settings.autoLaunch"); // Whether the app auto-launches on startup
    const startMinimized = store.get("settings.launchMinimized"); // Whether the app starts minimized
    const startHidden = startLaunched && startMinimized; // Determine if the app should start hidden

    // Handle the window's visibility based on startup settings
    if (startHidden) {
      mainApp.hide(); // Hide the window if auto-launch and minimize-on-start are enabled
    } else {
      mainApp.show(); // Show the window otherwise
    }

    store.set("isHidden", startHidden); // Store the initial hidden state
    setMenu(app, mainWindow); // Set up the main application menu
    setTray(app, mainWindow); // Set up the tray icon and menu
  });
});

// Configure the app to handle auto-launch settings
handleAutoLaunch();

// Event to quit the app when all windows are closed, except on macOS (where apps generally stay running)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit(); // Quit the app if not running on macOS
  }
});

// macOS-specific behavior to re-open the window if the app is activated and no windows are visible
app.on("activate", () => {
  if (mainWindow) {
    mainWindow.show(); // Show the main window if it exists
  }
});

//---------------------- helpers ---------------------- //

// Helper function to set up the application menu
function setMenu(app, mainWindow) {
  const template = createWindowMenuTemplate(app, mainWindow); // Create the window menu template
  const menu = Menu.buildFromTemplate(template); // Build the menu from the template
  Menu.setApplicationMenu(menu); // Set the menu as the app's main menu
}

// Helper function to set up the tray icon and menu
function setTray(app, mainWindow) {
  const template = createTrayMenuTemplate(app, mainWindow); // Create the tray menu template
  const menu = Menu.buildFromTemplate(template); // Build the menu from the template
  const isHidden = store.get("isHidden"); // Get the current hidden state from the store

  // If the tray icon hasn't been created yet, create it
  if (!tray) {
    tray = new Tray(trayIcon); // Create a new tray icon
    tray.setContextMenu(menu); // Set the context menu for the tray icon

    // On Windows, handle tray icon clicks to show/focus the window
    if (process.platform === "win32") {
      tray.on("click", () => {
        if (!mainWindow.isVisible()) {
          mainWindow.show(); // Show the window if it's hidden
        }
        mainWindow.focus(); // Focus the window
      });
    }
  } else {
    tray.setContextMenu(menu); // Update the tray menu if the tray already exists
  }

  // Set a tooltip for the tray icon based on whether the app is hidden or running
  tray.setToolTip(isHidden ? "App is minimized" : "App is running");
}
