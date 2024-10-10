require("dotenv").config();
// const options = require("./configs");
const { fetchOwner } = require("./owner");
const {
  validateVariables,
  updateEnvVariable,
  deployService,
  handleError,
} = require("./helpers");
const {
  createDatabase,
  deleteDatabase,
  fetchConnectionInfo,
  checkDbStatus,
} = require("./database");
const { store } = require("../store");

const databaseKey = process.env.DATABASE_ENV_KEY; // name of key for render database

const rebuildRender = async () => {
  // const isValid = await validateVariables();
  // if (!isValid) return;

  try {
    store.set("reloading", true);
    const owner = await fetchOwner();
    const services = Object.values(store.get("services")) || null;
    const database = store.get("database") || null;

    if (database) {
      const deleteDb = await deleteDatabase(database.id);
      if (deleteDb.status !== 204) {
        console.error("Failed to delete existing database.");
        return;
      }
    }

    const { id, name, status, createdAt } = await createDatabase(owner.id);
    const { internalConnectionString } = await fetchConnectionInfo(id);
    const newDb = { id, name, status, internalConnectionString, createdAt };

    console.log("Waiting for database...");
    let dbStatus = await checkDbStatus(newDb);

    if (dbStatus === "available") {
      console.log("Database is available");
      for (const service of services) {
        await updateEnvVariable(
          service.id,
          databaseKey,
          internalConnectionString
        );
        await deployService(service);
      }
      store.set("rebuilt", true);
      console.log("Done!");
    } else {
      console.log("Something went wrong with your database");
    }
  } catch (error) {
    console.error("error ==> ", error);
    handleError(error, "rebuildRender");
  }
};

module.exports = { rebuildRender };
