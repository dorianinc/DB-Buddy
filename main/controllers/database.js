const axios = require("axios");
const { render, options } = require("./configs");
const { store } = require("../store");
const { isEmpty } = require("./helpers");

// Database --------------------------------------------------------------------------------------------

const fetchDatabase = async () => {
  try {
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
    console.error("error in fetchDatabase: ", error);
    throw error;
  }
};

const fetchConnectionInfo = async (databaseId) => {
  try {
    const response = await axios.get(
      `${render.baseUrl}/postgres/${databaseId}/connection-info`,
      options
    );
    return response.data;
  } catch (error) {
    console.error("error in fetchConnectionInfo: ", error);
    throw error;
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
      `${render.baseUrl}/postgres`,
      body,
      options
    );
    return response.data;
  } catch (error) {
    console.error("error in createDatabase: ", error);
    throw error;
  }
};
// id: 'dpg-cs4r52tumphs73ajg6tg-a',

const deleteDatabase = async (databaseId) => {
  try {
    const response = await axios.delete(
      `${render.baseUrl}/postgres/${databaseId}`,
      options
    );
    return response;
  } catch (error) {
    console.error("error in deleteDatabase: ", error);
    throw error;
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
          `${render.baseUrl}/postgres/${database.id}`,
          options
        );
        const { status } = response.data;
        databaseStatus = status;
      }
      store.set("database.status", databaseStatus);
      resolve(databaseStatus);
    } catch (error) {
      console.error("Failed checkDbStatus: ", error);
      throw error;
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
