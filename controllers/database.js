require("dotenv").config();
const axios = require("axios");
const options = require("./configs");
const { isEmpty, handleError } = require("./helpers");
const { formatDistanceToNow } = require("date-fns");
const { store } = require("../store");

const baseUrl = "https://api.render.com/v1";
const databaseName = process.env.DATABASE_NAME; // name of new render database
const region = process.env.REGION.toLowerCase(); // region you use for your applications

// Database --------------------------------------------------------------------------------------------

const fetchDatabase = async (refresh) => {
  try {
    const storedDatabase = !refresh && store.get("database");
    if (storedDatabase && !isEmpty(storedDatabase)) return storedDatabase;

    const response = await axios.get(`${baseUrl}/postgres`, options);
    const freeDatabase = response.data
      .filter((db) => db.postgres.plan === "free")
      .map((db) => db.postgres)[0];

    if (!isEmpty(freeDatabase)) {
      const { id, name, version } = freeDatabase;
      const { internalConnectionString } = await fetchConnectionInfo(id);
      const database = {
        id,
        name,
        version,
        internalDatabaseUrl: internalConnectionString,
      };
      
      database.lastDeployed = formatDistanceToNow(freeDatabase.updatedAt);
      database.status = "creating";

      store.set("database", database);
      checkDbStatus(database);

      return database;
    }

    return null;
  } catch (error) {
    handleError(error, "fetchDatabase");
    return null;
  }
};

const fetchConnectionInfo = async (databaseId) => {
  try {
    const response = await axios.get(
      `${baseUrl}/postgres/${databaseId}/connection-info`,
      options
    );
    return response.data;
  } catch (error) {
    handleError(error, "fetchConnectionInfo");
    return null;
  }
};

const createDatabase = async (ownerId) => {
  console.log("Creating new database");
  const body = {
    enableHighAvailability: false,
    plan: "free",
    version: "16",
    name: databaseName,
    ownerId,
    region,
  };

  try {
    const response = await axios.post(`${baseUrl}/postgres`, body, options);
    return response.data;
  } catch (error) {
    handleError(error, "createDatabase");
  }
};

const deleteDatabase = async (databaseId) => {
  console.log("Deleting existing database");
  try {
    const response = await axios.delete(
      `${baseUrl}/postgres/${databaseId}`,
      options
    );
    return response;
  } catch (error) {
    handleError(error, "deleteDatabase");
  }
};

const checkDbStatus = async (database) => {
  return new Promise(async (resolve) => {
    try {
      let databaseStatus = database.status || "creating";
      while (databaseStatus === "creating") {
        await new Promise(async (timeoutResolve) =>
          setTimeout(timeoutResolve, 10000)
        );

        const response = await axios.get(
          `${baseUrl}/postgres/${database.id}`,
          options
        );
        const { status } = response.data;
        databaseStatus = status;
      }
      store.set("database.status", databaseStatus);
      resolve(databaseStatus);
    } catch (error) {
      console.error("Failed checking database status: ", error.message);
      return false;
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

// click rebuild
//
