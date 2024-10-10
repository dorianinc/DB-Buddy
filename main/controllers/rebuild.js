const { fetchOwner } = require("./owner");
const {
  validateVariables,
  updateEnvVariable,
  deployService,
} = require("./helpers");
const {
  createDatabase,
  deleteDatabase,
  fetchConnectionInfo,
  checkDbStatus,
} = require("./database");
const { store } = require("../store");

const databaseKey = store.get("settings.dbKey");

const rebuildRender = async () => {
  // const isValid = await validateVariables();
  // if (!isValid) return;

  try {
    store.set("reloading", true);
    const owner = await fetchOwner();
    const services = Object.values(store.get("services")) || null;
    // block if no services
    const database = store.get("database") || null;
    console.log("🖥️  database: ", store.get("database"));

    if (database) {
      const deleteDb = await deleteDatabase(database.id);
      if (deleteDb.status !== 204) {
        console.error("Failed to delete existing database.");
        return;
      }
    }

    const { id, name, version, status, createdAt } = await createDatabase(
      owner.id
    );
    const { internalConnectionString } = await fetchConnectionInfo(id);
    const newDb = {
      id,
      name,
      version,
      status,
      createdAt,
      internalConnectionString,
    };

    store.set("database", newDb);

    let dbStatus = await checkDbStatus(newDb);
    if (dbStatus === "available") {
      for (const service of services) {
        await updateEnvVariable(
          service.id,
          databaseKey,
          internalConnectionString
        );
        await deployService(service);
      }
      store.set("rebuilt", true);
    }
  } catch (error) {
    console.error("error in rebuildRender: ", {
      status: error.status,
      nessage: append.message,
    });
    throw error;
  }
};

module.exports = { rebuildRender };
