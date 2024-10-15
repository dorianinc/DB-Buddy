const Store = require("electron-store");

const serviceSchema = {
  type: "object",
  patternProperties: {
    "^.+$": {
      type: "object",
      properties: {
        id: {
          type: "string",
          default: null,
          minLength: 1,
        },
        name: {
          type: "string",
          default: null,
          minLength: 1,
        },
        status: {
          type: "string",
          default: null,
          enum: ["deployed", "deploying", "pending", "failed"],
        },
        type: {
          type: "string",
          default: null,
          enum: ["web_service"],
        },
      },
      required: ["id", "name", "status", "type"],
    },
  },
};

const databaseSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      default: null,
      minLength: 1,
    },
    name: {
      type: "string",
      default: null,
      minLength: 1,
    },
    version: {
      type: "string",
      default: null,
      pattern: "^[0-9]+$",
    },
    status: {
      type: "string",
      default: null,
      enum: ["creating", "available", "unavailable", "unknown"],
    },
    createdAt: {
      type: "string",
      default: null,
      minLength: 1,
    },
    internalConnectionString: {
      type: "string",
      default: null,
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
};

const settingsSchema = {
  type: "object",
  properties: {
    dbName: {
      type: "string",
      pattern: "^(?![_-])[a-zA-Z0-9_-]+(?<![_-])$",
      default: null,
      minLength: 1,
    },
    dbKey: {
      type: "string",
      pattern: "^[A-Z0-9_]+$",
      minLength: 1,
      default: null,
    },
    apiKey: {
      type: "string",
      pattern: "^rnd_.*$",
      minLength: 5,
      default: null,
    },
    region: {
      type: "string",
      default: null,
      enum: ["oregon", "ohio", "virginia", "frankfurt", "singapore"],
    },
    autoUpdate: {
      type: "boolean",
      default: false,
    },
    autoLaunch: {
      type: "boolean",
      default: false,
    },
    launchMinimized: {
      type: "boolean",
      default: false,
    },
  },
  required: [
    "dbName",
    "dbKey",
    "apiKey",
    "region",
    "autoUpdate",
    "autoLaunch",
    "launchMinimized",
  ],
};

const schema = {
  reloading: { type: "boolean", default: false },
  rebuilt: { type: "boolean", default: false },
  isExiting: { type: "boolean", default: false },
  isHidden: { type: "boolean", default: false },
  services: serviceSchema,
  database: databaseSchema,
  settings: settingsSchema,
};

const store = new Store({ watch: true, schema, encryptionKey: "Pump3n1ck3l" });

const deployedServicesListeners = new Set();
const deployStoreListeners = (webContents) => {
  store.onDidChange("database.status", (newStatus) => {
    const { name } = store.get("database");
    webContents.send("set-database-status", { name, status: newStatus });
  });

  store.onDidChange("services", (newServices) => {
    Object.keys(newServices).forEach((serviceName) => {
      if (!deployedServicesListeners.has(serviceName)) {
        store.onDidChange(`services.${serviceName}.status`, (newStatus) => {
          webContents.send("set-service-status", {
            name: serviceName,
            status: newStatus,
          });
        });

        deployedServicesListeners.add(serviceName);
      }
    });

    const currentServices = Object.keys(newServices);
    deployedServicesListeners.forEach((serviceName) => {
      if (!currentServices.includes(serviceName)) {
        deployedServicesListeners.delete(serviceName);
      }
    });
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
