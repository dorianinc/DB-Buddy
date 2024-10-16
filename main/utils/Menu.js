const { store } = require("../store"); // Import the persistent storage module

//---------------------- createWindowMenuTemplate ---------------------- //

// Function to create the template for the application's main window menu
const createWindowMenuTemplate = (app, mainWindow) => {
  // Define the structure of the menu
  const menuTemplate = [
    {
      // The first menu item, typically the app's name on macOS or a "Menu" label on other platforms
      label: process.platform === "darwin" ? app.getName() : "Menu",
      submenu: [
        {
          // Option to rescan/re-render the app, with a keyboard shortcut
          label: "Rescan Render",
          accelerator: "CmdOrCtrl+Shift+R", // Shortcut: Command+Shift+R (macOS) or Ctrl+Shift+R (Windows/Linux)
          click: () => {
            // Send a message to the renderer process to refresh the app
            mainWindow.webContents.send("refresh-app", true);
          },
        },
        {
          // Option to open the settings window, with a keyboard shortcut
          label: "Settings",
          accelerator: "CmdOrCtrl+Shift+S", // Shortcut: Command+Shift+S (macOS) or Ctrl+Shift+S (Windows/Linux)
          click: () => {
            // Send a message to the renderer process to open the settings page
            mainWindow.webContents.send("open-settings");
          },
        },
      ],
    },

    // Edit menu with standard editing options (undo, redo, cut, copy, paste, etc.)
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z", // Shortcut for undo action
          role: "undo", // Role is mapped to Electron's default undo behavior
        },
        {
          label: "Redo",
          accelerator: "CmdOrCtrl+Shift+Z", // Shortcut for redo action
          role: "redo", // Electron's default redo behavior
        },
        {
          type: "separator", // A separator to divide groups of related actions
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X", // Shortcut for cutting selected content
          role: "cut", // Electron's default cut behavior
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C", // Shortcut for copying selected content
          role: "copy", // Electron's default copy behavior
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V", // Shortcut for pasting content
          role: "paste", // Electron's default paste behavior
        },
        {
          label: "Delete",
          accelerator: "Delete", // Shortcut for deleting selected content
          role: "delete", // Electron's default delete behavior
        },
        {
          type: "separator", // Another separator for visual clarity
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A", // Shortcut for selecting all content
          role: "selectAll", // Electron's default select all behavior
        },
      ],
    },
  ];

  return menuTemplate; // Return the constructed menu template
};

//---------------------- createTrayMenuTemplate ---------------------- //

// Function to create the template for the tray (system tray) menu
const createTrayMenuTemplate = (app, mainWindow) => {
  const isHidden = store.get("isHidden"); // Retrieve whether the main window is currently hidden
  const menuTemplate = [
    {
      // Option to exit the application from the tray
      label: "Exit",
      click: () => {
        store.set("isExiting", true); // Set the flag in the store to indicate the app is exiting
        app.quit(); // Quit the application
      },
    },
  ];

  // If the app is hidden, add an option to show the app
  if (isHidden) {
    const trayItem = [
      {
        label: "Show App", // Option to show the hidden app
        click: () => {
          mainWindow.show(); // Show the main window
        },
      },
      {
        type: "separator", // A separator to separate the 'Show App' option from 'Exit'
      },
    ];
    menuTemplate.unshift(...trayItem); // Add the 'Show App' option at the beginning of the tray menu
  }

  return menuTemplate; // Return the constructed tray menu template
};

// Export both functions for use in other modules
module.exports = {
  createWindowMenuTemplate,
  createTrayMenuTemplate,
};
