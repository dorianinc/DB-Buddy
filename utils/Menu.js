exports.createTemplate = (app, openSettings) => {
  return [
    {
      label: process.platform === "darwin" ? app.getName() : "Menu",
      submenu: [
        {
          label: "Settings",
          click: () => {
            openSettings();
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
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          // role defined already some predifined behaviour
          role: "copy",
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          // role defined already some predifined behaviour
          role: "cut",
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          // role defined already some predifined behaviour
          role: "paste",
        },
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          // role defined already some predifined behaviour
          role: "undo",
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: (_, focusedWindow) => {
            if (focusedWindow) {
              // on reload, start fresh and close any old
              // open secondary windows
              if (focusedWindow.id === 1) {
                const { BrowserWindow } = require("electron");
                BrowserWindow.getAllWindows().forEach((win) => {
                  if (win.id > 1) {
                    win.close();
                  }
                });
              }
              focusedWindow.reload();
            }
          },
        },
        {
          type: "separator",
        },
        {
          label: "App Menu Demo",
          click: function (_, focusedWindow) {
            if (focusedWindow) {
              const options = {
                type: "info",
                title: "Application Menu Demo",
                buttons: ["Ok", "Cancel"],
                message:
                  "This demo is for the Menu section, showing how to create a clickable menu item in the application menu.",
              };
              const { dialog } = require("electron");
              dialog.showMessageBox(focusedWindow, options);
            }
          },
        },
      ],
    },
    {
      label: "Window",
      role: "window",
      submenu: [
        {
          label: "Minimize",
          accelerator: "CmdOrCtrl+M",
          role: "minimize",
        },
        {
          label: "Close",
          accelerator: "CmdOrCtrl+W",
          role: "close",
        },
        {
          type: "separator",
        },
        {
          label: "Reopen Window",
          accelerator: "CmdOrCtrl+Shift+T",
          enabled: false,
          click: () => {
            app.emit("activate");
          },
        },
      ],
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
