const Store = require("electron-store");

const schema = {
  services: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: {
          type: "string",
          minLength: 1, // Ensures the name is not empty
        },
        name: {
          type: "string",
          minLength: 1, // Ensures the name is not empty
        },
        type: {
          type: "string",
          enum: ["web_service"], // Allowed types
        },
        status: {
          type: "string",
          enum: ["deployed", "pending", "failed"], // Allowed statuses
        },
        lastDeployed: {
          type: "string",
          minLength: 1, // Ensures lastDeployed is not empty
        },
      },
      required: ["id", "name", "type", "status", "lastDeployed"], // Require these fields
    },
  },
  database: {
    type: "object",
    properties: {
      id: {
        type: "string",
        minLength: 1, // Ensures the ID is not empty
      },
      name: {
        type: "string",
        minLength: 1, // Ensures the name is not empty
      },
      status: {
        type: "string",
        enum: ["available", "unavailable", "deployed"], // Define allowed statuses
      },
      version: {
        type: number,
      },
      lastDeployed: {
        type: "string",
        minLength: 1, // Ensures lastDeployed is not empty
      },
      internalDatabaseUrl: {
        type: "string",
        format: "uri", // This will check if the string is a valid URI
      },
    },
    required: [
      "id",
      "name",
      "status",
      "version",
      "lastDeployed",
      "internalDatabaseUrl",
    ], // All fields are required
  },
};

const store = new Store({ schema });

module.exports = store;
