const Store = require("electron-store");

const schema = {
  services: {
    type: "array",
    items: {
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
        type: {
          type: "string",
          enum: ["web_service"],
        },
        status: {
          type: "string",
          enum: ["deployed", "pending", "failed"],
        },
        lastDeployed: {
          type: "string",
          minLength: 1,
        },
      },
      required: ["id", "name", "type", "status", "lastDeployed"],
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
      status: {
        type: "string",
        enum: ["available", "unavailable", "deployed"],
      },
      version: {
        type: "string",
        pattern: "^[0-9]+$",
      },
      lastDeployed: {
        type: "string",
        minLength: 1,
      },
      internalDatabaseUrl: {
        type: "string",
        format: "uri",
      },
    },
    required: [
      "id",
      "name",
      "status",
      "version",
      "lastDeployed",
      "internalDatabaseUrl",
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

const store = new Store({ watch: true, schema });

const deployStoreListeners = (webContents) => {
  store.onDidChange("database.status", (newValue) => {
    const name = store.get("database.name");
    webContents.send("set-database-status", {
      name,
      status: newValue,
    });
  });
};

module.exports = { store, deployStoreListeners };
