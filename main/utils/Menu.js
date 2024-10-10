exports.createTemplate = (app, webContents) => {
  return [
    {
      label: process.platform === "darwin" ? app.getName() : "Menu",
      submenu: [
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+Shift+S", 
          click: () => {
            webContents.send("open-settings");
          },
        },
        {
          label: "Rescan Render",
          accelerator: "CmdOrCtrl+Shift+R", 
          click: () => {
            webContents.send("refresh-app", true);
          },
        },
        {
          label: "Exit",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z", // Undo shortcut
          role: "undo",
        },
        {
          label: "Redo",
          accelerator: "CmdOrCtrl+Shift+Z", // Common redo shortcut on many platforms
          role: "redo",
        },
        {
          type: 'separator' // Line after Redo
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X", // Standard cut shortcut
          role: "cut",
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C", // Standard copy shortcut
          role: "copy",
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V", // Standard paste shortcut
          role: "paste",
        },
        {
          label: "Delete",
          accelerator: "Delete", // Standard delete key
          role: "delete",
        },
        {
          type: 'separator' // Line before Delete
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A", // Standard select all shortcut
          role: "selectAll",
        },
        {
          type: 'separator' // Line after Delete
        }
      ]
    },      
    {
      label: "Help",
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: () => {
            // The shell module provides functions related to desktop integration.
            // An example of opening a URL in the user's default browser:
            const { shell } = require("electron");
            shell.openExternal("http://electron.atom.io");
          },
        },
      ],
    },
  ];
};
