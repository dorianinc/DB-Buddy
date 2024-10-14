const Store = require("electron-store");

// Splitting schema into sections for readability
const serviceSchema = {
  type: "object",
  patternProperties: {
    "^.+$": {
      type: "object",
      properties: {
        id: { type: "string", minLength: 1 },
        name: { type: "string", minLength: 1 },
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
};

const databaseSchema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1 },
    version: { type: "string", pattern: "^[0-9]+$" },
    status: {
      type: "string",
      enum: ["creating", "available", "unavailable", "unknown"],
    },
    createdAt: { type: "string", minLength: 1 },
    internalConnectionString: { type: "string", format: "uri" },
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
      minLength: 1,
    },
    dbKey: { type: "string", pattern: "^[A-Z0-9_]+$", minLength: 1 },
    apiKey: { type: "string", pattern: "^rnd_.*$", minLength: 5 },
    region: {
      type: "string",
      enum: ["oregon", "ohio", "virginia", "frankfurt", "singapore"],
    },
    autoUpdate: { type: "boolean", default: false },
    autoLaunch: { type: "boolean", default: false },
  },
  required: ["dbName", "dbKey", "apiKey", "region", "autoUpdate", "autoLaunch"],
};

const schema = {
  reloading: { type: "boolean", default: false },
  rebuilt: { type: "boolean", default: false },
  isMinimized: { type: "boolean", default: false },
  services: serviceSchema,
  database: databaseSchema,
  settings: settingsSchema,
};

// Initialize store with schema and encryption key
const store = new Store({ watch: true, schema, encryptionKey: "Pump3n1ck3l" });

// Set to track which service listeners are already attached
const deployedDatabaseListeners = new Set();
const deployedServicesListeners = new Set();

// Function to deploy listeners efficiently without reattaching them unnecessarily
const deployStoreListeners = (webContents) => {
  // Attach listener for database.status only once
  store.onDidChange("database.status", (newStatus) => {
    const { name } = store.get("database");
    webContents.send("set-database-status", { name, status: newStatus });
  });

  // Attach service status listeners only if they haven't been attached
  store.onDidChange("services", (newServices) => {
    Object.keys(newServices).forEach((serviceName) => {
      // Check if we've already attached a listener for this service's status
      if (!deployedServicesListeners.has(serviceName)) {
        store.onDidChange(`services.${serviceName}.status`, (newStatus) => {
          webContents.send("set-service-status", { name: serviceName, status: newStatus });
        });

        // Mark this service as having its listener attached
        deployedServicesListeners.add(serviceName);
      }
    });

    // Optional: Clean up listeners for removed services
    const currentServices = Object.keys(newServices);
    deployedServicesListeners.forEach((serviceName) => {
      if (!currentServices.includes(serviceName)) {
        deployedServicesListeners.delete(serviceName); // Remove from the tracking set if no longer present
      }
    });
  });

  // Listener for reloading the app
  store.onDidChange("reloading", (newValue) => {
    if (newValue) {
      webContents.send("reload-app", true);
      store.set("reloading", false); // Reset the reloading flag after sending the event
    }
  });

  // Listener for rebuilding the app
  store.onDidChange("rebuilt", (newValue) => {
    if (newValue) {
      webContents.send("refresh-app", true);
      store.set("rebuilt", false); // Reset the rebuilt flag after sending the event
    }
  });
};

module.exports = { store, deployStoreListeners };
