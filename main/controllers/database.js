const axios = require("axios");
const { getConfigs } = require("./configs");
const { store } = require("../store");
const { isEmpty } = require("./helpers");

// Database --------------------------------------------------------------------------------------------

const fetchDatabase = async () => {
  try {
    const { render, options } = getConfigs();
    const response = await axios.get(`${render.baseUrl}/postgres`, options);
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
    console.error("error in fetchDatabase");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
  }
};

const fetchConnectionInfo = async (databaseId) => {
  try {
    const { render, options } = getConfigs();
    const response = await axios.get(
      `${render.baseUrl}/postgres/${databaseId}/connection-info`,
      options
    );
    if (isEmpty(response.data)) return null;
    return response.data;
  } catch (error) {
    console.error("error in fetchConnectionInfo");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
  }
};

const createDatabase = async (ownerId) => {
  console.log("creating new database");
  try {
    const { render, options } = getConfigs();
    const body = {
      enableHighAvailability: false,
      plan: "free",
      version: "16",
      name: render.databaseName,
      ownerId,
      region: render.region,
    };
    const response = await axios.post(
      `${render.baseUrl}/postgres`,
      body,
      options
    );
    console.log("data ==>", response.data);
    if (isEmpty(response.data)) return null;
    return response.data;
  } catch (error) {
    console.error("error in createDatabase");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
  }
};

const deleteDatabase = async (databaseId) => {
  try {
    const { render, options } = getConfigs();
    const response = await axios.delete(
      `${render.baseUrl}/postgres/${databaseId}`,
      options
    );
    if (response.status !== 204) {
      throw new Error("Error while attempting to delete database");
    }
    return { success: true };
  } catch (error) {
    console.error("error in deleteDatabase");
    throw {
      message: error.response?.data,
      statusCode: error.status,
      method: error.request?.method,
    };
  }
};

const checkDbStatus = async (database) => {
  return new Promise(async (resolve) => {
    try {
      const { render, options } = getConfigs();
      let databaseStatus = database.status || "creating";
      while (["creating", "unknown"].includes(databaseStatus)) {
        await new Promise(async (timeoutResolve) =>
          setTimeout(timeoutResolve, 10000)
        );

        const response = await axios.get(
          `${render.baseUrl}/postgres/${database.id}`,
          options
        );
        if (isEmpty(response.data)) return null;
        const { status } = response.data;
        databaseStatus = status;
      }
      store.set("database.status", databaseStatus);
      resolve(databaseStatus);
    } catch (error) {
      console.error("error in checkDbStatus");
      throw {
        message: error.response?.data,
        statusCode: error.status,
        method: error.request?.method,
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
