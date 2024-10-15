const { store } = require("../store");


exports.createTemplate = (app, mainWindow, isHidden) => {
  const menuTemplate = [
    {
      label: process.platform === "darwin" ? app.getName() : "Menu",
      submenu: [
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => {
            mainWindow.webContents.send("open-settings");
          },
        },
        {
          label: "Rescan Render",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            mainWindow.webContents.send("refresh-app", true);
          },
        },
      ],
    },

    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          role: "undo",
        },
        {
          label: "Redo",
          accelerator: "CmdOrCtrl+Shift+Z",
          role: "redo",
        },
        {
          type: "separator",
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          role: "cut",
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          role: "copy",
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          role: "paste",
        },
        {
          label: "Delete",
          accelerator: "Delete",
          role: "delete",
        },
        {
          type: "separator",
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          role: "selectAll",
        },
      ],
    },
    {
      type: "separator",
    },
    {
      label: "Exit",
      click: () => {
        store.set("isExiting", true);
        app.quit();
      },
    },
  ];

  // Add "Show App" menu item if the app is minimized
  if (isHidden) {
    const trayItem = [
      {
        label: "Show App",
        click: () => {
          mainWindow.show();
        },
      },
      {
        type: "separator",
      },
    ]
    menuTemplate.unshift(
      ...trayItem
    );
  }

  return menuTemplate;
};
