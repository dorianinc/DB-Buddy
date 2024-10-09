require("dotenv").config();
// const options = require("./configs");
const { fetchOwner } = require("./owner");
const { listenToServiceStatus } = require("./service");
const { validateVariables, handleError } = require("./helpers");
const {
  createDatabase,
  deleteDatabase,
  fetchConnectionInfo,
  checkDbStatus,
} = require("./database");
const { store } = require("../store");

const databaseKey = process.env.DATABASE_ENV_KEY; // name of key for render database

const rebuildRender = async () => {
  const isValid = await validateVariables();
  if (!isValid) return;

  try {
    const owner = await fetchOwner();
    const services = store.get("services") || null;
    const database = store.get("database") || null;

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

      listenToServiceStatus(services);

      console.log("Done!");
    } else {
      console.log("Something went wrong with your database");
    }
  } catch (error) {
    handleError(error, "rebuildRender");
  }
};

module.exports = { rebuildRender };
