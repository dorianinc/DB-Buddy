const Store = require("electron-store");

const schema = {
  reloading: {
    type: "boolean",
    default: false,
  },
  rebuilt: {
    type: "boolean",
    default: false,
  },
  services: {
    type: "object",
    patternProperties: {
      "^.+$": {
        type: "object",
        properties: {
          id: {
            type: "string",
            minLength: 1,
          },
          name: {
            type: "string",
            minLength: 1,
          },
          status: {
            type: "string",
            enum: ["deployed", "deploying", "pending", "failed"],
          },
          type: {
            type: "string",
            enum: ["web_service"],
          },
        },
        required: ["id", "name", "status", "type"],
      },
    },
  },
  database: {
    type: "object",
    properties: {
      id: {
        type: "string",
        minLength: 1,
      },
      name: {
        type: "string",
        minLength: 1,
      },
      version: {
        type: "string",
        pattern: "^[0-9]+$",
      },
      status: {
        type: "string",
        enum: ["creating", "available", "unavailable"],
      },
      createdAt: {
        type: "string",
        minLength: 1,
      },
      internalConnectionString: {
        type: "string",
        format: "uri",
      },
    },
    required: [
      "id",
      "name",
      "status",
      "version",
      "createdAt",
      "internalConnectionString",
    ],
  },
  settings: {
    type: "object",
    properties: {
      dbName: {
        type: "string",
        pattern: "^(?![_-])[a-zA-Z0-9_-]+(?<![_-])$",
        minLength: 1,
      },
      dbKey: {
        type: "string",
        pattern: "^[A-Z0-9_]+$",
        minLength: 1,
      },
      apiKey: {
        type: "string",
        pattern: "^rnd_.*$",
        minLength: 5,
      },
      region: {
        type: "string",
        enum: ["oregon", "ohio", "virginia", "frankfurt", "singapore"],
      },
    },
    required: ["dbName", "dbKey", "apiKey", "region"],
  },
};

// Initialize store with the corrected schema
const store = new Store({ watch: true, encryptionKey: "Pump3n1ck3l" });
// store.clear();

const deployStoreListeners = (webContents) => {
  store.onDidChange("database", (newDatabase) => {
    console.log("🖥️  newDatabase: ", newDatabase)
    store.onDidChange("database.status", (newStatus) => {
      console.log("🖥️  newStatus: ", newStatus)
      const name = newDatabase.name;
      webContents.send("set-database-status", {
        name,
        status: newStatus,
      });
    });
  });

  store.onDidChange("services", (newServices) => {
    for (let serviceName in newServices) {
      store.onDidChange(`services.${serviceName}.status`, (newStatus) => {
        webContents.send("set-service-status", {
          name: serviceName,
          status: newStatus,
        });
      });
    }
  });


  store.onDidChange("reloading", (newValue) => {
    if (newValue) {
      webContents.send("reload-app", true);
      store.set("reloading", false);
    }
  });
  store.onDidChange("rebuilt", (newValue) => {
    if (newValue) {
      webContents.send("refresh-app", true);
      store.set("rebuilt", false);
    }
  });
};

module.exports = { store, deployStoreListeners };
