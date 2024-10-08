require("dotenv").config();
const axios = require("axios");
const options = require("./configs");
const { formatDistanceToNow } = require("date-fns");
const { store } = require("../store");

const baseUrl = "https://api.render.com/v1";
const databaseName = process.env.DATABASE_NAME; // name of new render database
const databaseKey = process.env.DATABASE_ENV_KEY; // name of key for render database
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
      const database = { id, name, version };

      database.status = refresh ? "creating" : await checkDbStatus(database);
      database.lastDeployed = formatDistanceToNow(freeDatabase.updatedAt);

      const { internalConnectionString } = await fetchConnectionInfo(id);
      database.internalDatabaseUrl = internalConnectionString || null;
      
      checkDbStatus(database);
      store.set("database", database);
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

const rebuildDatabase = async () => {
  const isValid = await validateVariables();
  if (!isValid) return;

  try {
    const owner = await fetchOwner();
    const services = await fetchServices();
    const database = await fetchDatabase();

    if (database) {
      const deleteDb = await deleteDatabase(database.id);
      if (deleteDb.status !== 204) {
        console.error("Failed to delete existing database.");
        return;
      }
    }

    const { name, status, id, createdAt } = await createDatabase(owner.id);
    const newDb = { name, status, id, createdAt };
    const { internalConnectionString } = await fetchConnectionInfo(id);
    newDb.internalDatabaseUrl = internalConnectionString;

    console.log("Waiting for database...");
    let dbStatus = await checkDbStatus(database);

    if (dbStatus === "available") {
      console.log("Database is available");
      console.log("Updating Services");
      for (const service of services) {
        await updateEnvVariable(
          service.id,
          databaseKey,
          newDb.internalDatabaseUrl
        );
        await deployService(service);
      }

      console.log("Waiting for service status(es)...");
      console.log("You can close the program now if you like");

      await Promise.all(services.map((service) => checkServiceStatus(service)));
      console.log("Done!");
    } else {
      console.log("Something went wrong with your database");
    }
  } catch (error) {
    handleError(error, "rebuildDatabase");
  }
};

const handleError = (error, functionName) => {
  const statusCode = error.response?.status;
  const errorMessage =
    error.response?.data?.message || "An unknown error occurred";

  console.error(
    `Error in ${functionName}: ${errorMessage} ${
      !statusCode ? "" : `Status code: ${statusCode}`
    }`
  );

  throw new Error(
    `Error in ${functionName}: ${errorMessage} ${
      !statusCode ? "" : `Status code: ${statusCode}`
    }`
  );
};

function isEmpty(obj) {
  return Object.values(obj).length === 0;
}

module.exports = {
  fetchDatabase,
  fetchConnectionInfo,
  createDatabase,
  deleteDatabase,
  rebuildDatabase,
  checkDbStatus,
};
