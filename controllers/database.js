require("dotenv").config();
const axios = require("axios");
const options = require("./configs");
const { formatDistanceToNow } = require("date-fns");
const store = require("../store/index");

const baseUrl = "https://api.render.com/v1";
const databaseName = process.env.DATABASE_NAME; // name of new render database
const databaseKey = process.env.DATABASE_ENV_KEY; // name of key for render database
const region = process.env.REGION.toLowerCase(); // region you use for your applications

// Database --------------------------------------------------------------------------------------------

const fetchDatabase = async (databaseId) => {
  try {
    const storedDatabase = store.get("database");
    if (storedDatabase && !isEmpty(storedDatabase)) return storedDatabase;

    const response = databaseId
      ? await axios.get(`${baseUrl}/postgres/${databaseId}`, options)
      : await axios.get(`${baseUrl}/postgres`, options);

    if (databaseId && response.data) {
      const database = response.data;
      const connectionInfo = await fetchConnectionInfo(databaseId);
      database.connectionInfo = connectionInfo || null;
      store.set("database", database);
      return database;
    }

    const freeDatabases = response.data
      .filter((db) => db.postgres.plan === "free")
      .map((db) => db.postgres);

    if (freeDatabases.length > 0) {
      const database = freeDatabases[0];
      database.lastDeployed = lastDeployed =
        formatDistanceToNow(database.updatedAt) + " ago";
      const connectionInfo = await fetchConnectionInfo(database.id);
      database.connectionInfo = connectionInfo || null;
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

const checkDbStatus = async () => {
  try {
    await new Promise(async (resolve) => setTimeout(resolve, 10000));
    const { status } = await fetchDatabase();
    return status;
  } catch (error) {
    console.error(c.red("Failed checking database status: "), error.message);
    return false;
  }
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
        console.error(c.red("Failed to delete existing database."));
        return;
      }
    }

    const { name, status, id, createdAt } = await createDatabase(owner.id);
    const newDb = { name, status, id, createdAt };
    const { internalConnectionString } = await fetchConnectionInfo(id);
    newDb.internalDatabaseUrl = internalConnectionString;

    let dbStatus = "creating";

    console.log(c.yellow("Waiting for database..."));

    while (dbStatus === "creating") {
      dbStatus = await checkDbStatus();
    }

    if (dbStatus === "available") {
      console.log(c.green("Database is available"));
      console.log("Updating Services");
      for (const service of services) {
        await updateEnvVariable(
          service.id,
          databaseKey,
          newDb.internalDatabaseUrl
        );
        await deployService(service);
      }

      console.log(c.yellow("Waiting for service status(es)..."));
      console.log(c.yellow("You can close the program now if you like"));

      await Promise.all(services.map((service) => checkServiceStatus(service)));
      console.log(c.green("Done!"));
    } else {
      console.log(c.red("Something went wrong with your database"));
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
    c.red(
      `Error in ${functionName}: ${errorMessage} ${
        !statusCode ? "" : `Status code: ${statusCode}`
      }`
    )
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
