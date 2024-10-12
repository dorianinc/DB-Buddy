const axios = require("axios");
const { getConfigs } = require("./configs");
const { store } = require("../store");
const { isEmpty } = require("./helpers");

// Database --------------------------------------------------------------------------------------------

const fetchDatabase = async () => {
  try {
    const response = await axios.get(
      `${getConfigs().render.baseUrl}/postgres`,
      getConfigs().options
    );
    if (isEmpty(response.data)) return null;

    const freeDatabase = response.data
      .filter((db) => db.postgres.plan === "free")
      .map((db) => db.postgres)[0];

    if (!isEmpty(freeDatabase)) {
      const { id, name, version, createdAt } = freeDatabase;
      const { internalConnectionString } = await fetchConnectionInfo(id);
      const database = {
        id,
        name,
        version,
        createdAt,
        internalConnectionString,
      };

      database.status = "creating";
      store.set("database", database);

      return database;
    } else {
      return null;
    }
  } catch (error) {
    console.error("error in fetchDatabase: ", {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    });
    throw {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    };
  }
};

const fetchConnectionInfo = async (databaseId) => {
  try {
    const response = await axios.get(
      `${getConfigs().render.baseUrl}/postgres/${databaseId}/connection-info`,
      getConfigs().options
    );
    return response.data;
  } catch (error) {
    console.error("error in fetchConnectionInfo: ", {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    });
    throw {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    };
  }
};

const createDatabase = async (ownerId) => {
  const body = {
    enableHighAvailability: false,
    plan: "free",
    version: "16",
    name: render.databaseName,
    ownerId,
    region: render.region,
  };

  try {
    const response = await axios.post(
      `${getConfigs().render.baseUrl}/postgres`,
      body,
      getConfigs().options
    );
    return response.data;
  } catch (error) {
    console.error("error in createDatabase: ", {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    });
    throw {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    };
  }
};

const deleteDatabase = async (databaseId) => {
  try {
    const response = await axios.delete(
      `${getConfigs().render.baseUrl}/postgres/${databaseId}`,
      getConfigs().options
    );
    return response;
  } catch (error) {
    console.error("error in deleteDatabase: ", {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    });
    throw {
      message: error.message,
      statusCode: error.status,
      method: error.request.method,
    };
  }
};

const checkDbStatus = async (database) => {
  return new Promise(async (resolve) => {
    try {
      let databaseStatus = database.status || "creating";
      while (["creating", "unknown"].includes(databaseStatus)) {
        await new Promise(async (timeoutResolve) =>
          setTimeout(timeoutResolve, 10000)
        );

        const response = await axios.get(
          `${getConfigs().render.baseUrl}/postgres/${database.id}`,
          getConfigs().options
        );
        const { status } = response.data;
        databaseStatus = status;
      }
      store.set("database.status", databaseStatus);
      resolve(databaseStatus);
    } catch (error) {
      console.error("error in checkDbStatus: ", {
        message: error.message,
        statusCode: error.status,
        method: error.request.method,
      });
      throw {
        message: error.message,
        statusCode: error.status,
        method: error.request.method,
      };
    }
  });
};

module.exports = {
  fetchDatabase,
  fetchConnectionInfo,
  createDatabase,
  deleteDatabase,
  checkDbStatus,
};
