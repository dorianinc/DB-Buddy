exports.createTemplate = (app, webContents) => {
  return [
    {
      label: process.platform === "darwin" ? app.getName() : "Menu",
      submenu: [
        {
          label: "Settings",
          click: () => {
            webContents.send("open-settings");
          },
        },
        {
          label: "Refresh Application",
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
