const { fetchOwner } = require("./owner");
const { fetchServices } = require("./service");
const { updateEnvVariable, deployService } = require("./helpers");
const {
  fetchDatabase,
  createDatabase,
  deleteDatabase,
  fetchConnectionInfo,
  checkDbStatus,
} = require("./database");
const { store } = require("../store");
const { getConfigs } = require("./configs");
const { differenceInDays } = require("date-fns");

const rebuildRender = async () => {
  try {
    const { render } = getConfigs();
    store.set("isReloading", true);
    const owner = await fetchOwner();
    const services = Object.values(await fetchServices()) || null;
    // block if no services
    const database = (await fetchDatabase()) || null;

    if (database) {
      const deleteDb = await deleteDatabase(database.id);
      if (!deleteDb.success) {
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
          render.databaseKey,
          internalConnectionString
        );
        await deployService(service);
      }
      store.set("isRebuilt", true);
    }
  } catch (error) {
    console.error("error in rebuildRender: ", error);
    throw error;
  }
};

const checkDaysRemaining = async (creationDate) => {
  const pastDate = new Date(creationDate);
  const currentDate = new Date();
  const daysDifference = differenceInDays(currentDate, pastDate);
  const daysLeft = 30 - daysDifference;

  if (daysLeft <= 1) {
    await rebuildRender();
  }
};

module.exports = { rebuildRender, checkDaysRemaining };
