const Store = require("electron-store");

const serviceSchema = {
  type: "object",
  patternProperties: {
    "^.+$": {
      type: "object",
      properties: {
        id: {
          oneOf: [
            {
              type: "string",
              minLength: 1,
            },
            { type: "null" },
          ],
          default: null,
        },
        name: {
          oneOf: [
            {
              type: "string",
              minLength: 1,
            },
            { type: "null" },
          ],
          default: null,
        },
        status: {
          oneOf: [
            {
              type: "string",
              enum: ["deployed", "deploying", "pending", "failed"],
            },
            { type: "null" },
          ],
          default: null,
        },
        type: {
          oneOf: [
            {
              type: "string",
              enum: ["web_service"],
            },
            { type: "null" },
          ],
          default: null,
        },
      },
      required: ["id", "name", "status", "type"],
    },
  },
  default: {},
  additionalProperties: false,
};

const databaseSchema = {
  type: "object",
  properties: {
    id: {
      oneOf: [
        {
          type: "string",
          minLength: 1,
        },
        { type: "null" },
      ],
      default: null,
    },
    name: {
      oneOf: [
        {
          type: "string",
          minLength: 1,
        },
        { type: "null" },
      ],
      default: null,
    },
    version: {
      oneOf: [
        {
          type: "string",
          pattern: "^[0-9]+$",
        },
        { type: "null" },
      ],
      default: null,
    },
    status: {
      oneOf: [
        {
          type: "string",
          enum: ["creating", "available", "unavailable", "unknown"],
        },
        { type: "null" },
      ],
      default: null,
    },
    createdAt: {
      oneOf: [
        {
          type: "string",
          minLength: 1,
        },
        { type: "null" },
      ],
      default: null,
    },
    internalConnectionString: {
      oneOf: [
        {
          type: "string",
          format: "uri",
        },
        { type: "null" },
      ],
      default: null,
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
  default: {},
  additionalProperties: false,
};

const settingsSchema = {
  type: "object",
  properties: {
    dbName: {
      oneOf: [
        {
          type: "string",
          pattern: "^(?![_-])[a-zA-Z0-9_-]+(?<![_-])$",
          minLength: 1,
        },
        { type: "null" },
      ],
      default: null,
    },
    dbKey: {
      oneOf: [
        { type: "string", pattern: "^[A-Z0-9_]+$", minLength: 1 },
        { type: "null" },
      ],

      default: null,
    },
    apiKey: {
      oneOf: [
        { type: "string", pattern: "^rnd_.*$", minLength: 5 },
        { type: "null" },
      ],

      default: null,
    },
    region: {
      type: "string",
      default: "oregon",
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
  default: {},
  additionalProperties: false,
};

const schema = {
  isReloading: { type: "boolean", default: false },
  isRebuilt: { type: "boolean", default: false },
  isExiting: { type: "boolean", default: false },
  isHidden: { type: "boolean", default: false },
  services: serviceSchema,
  database: databaseSchema,
  settings: settingsSchema,
};

const store = new Store({ watch: true, schema });

(() => {
  const defaultSettings = Object.entries(settingsSchema.properties);
  for (const [key, config] of defaultSettings) {
    if (!store.has(`settings.${key}`)) {
      store.set(`settings.${key}`, config.default);
    }
  }
})();

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

  store.onDidChange("isReloading", (newValue) => {
    if (newValue) {
      webContents.send("reload-app", true);
      store.set("isReloading", false);
    }
  });

  store.onDidChange("isRebuilt", (newValue) => {
    if (newValue) {
      webContents.send("refresh-app", true);
      store.set("isRebuilt", false);
    }
  });
};

module.exports = { store, deployStoreListeners };
