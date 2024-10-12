const fetchRenderData = async (refresh) => {
  try {
    const fetchDatabase = await window.api.database.getDatabase(refresh);
    const fetchServices = await window.api.services.getServices(refresh);

    // Handle both successful fetch and API-level failure
    if (!fetchServices.success) {
      throw new Error(fetchServices.error.message);
    }
    if (!fetchDatabase.success) {
      throw new Error(fetchDatabase.error.message);
    }

    return { database: fetchDatabase.payload, apps: fetchServices.payload };
  } catch (error) {
    console.error("Error fetchRenderData:", error);
    throw error;
  }
};

const getContainers = () => {
  const statusContainer = document.querySelector("#status-container");
  const tableContainer = document.querySelector("#table-container");

  return { statusContainer, tableContainer };
};

const hasSettings = async () => {
  const settingsData = await window.api.settings.getSettings();
  const { dbName, dbKey, apiKey, region } = settingsData.payload;

  if (!dbName || !dbKey || !apiKey || !region) {
    return false;
  }
  return true;
};

const requestSetup = () => {
  const { statusContainer, tableContainer } = getContainers();
  statusContainer.innerHTML = "";
  statusContainer.style.display = "inline";
  tableContainer.style.display = "none";

  const mainMessage = document.createElement("h1");
  mainMessage.textContent = "Please set up the app in settings.";
  const subMessage = document.createElement("h3");
  subMessage.textContent = "Use 'CmdOrCtrl+Shift+S' for a shortcut.";
  statusContainer.append(mainMessage);
  statusContainer.append(subMessage);
};

const isEmpty = (obj) => {
  if (obj == null) return true;
  return Object.values(obj).length === 0;
};

const capitalize = (string) => {
  return string.replace(/\b\w/g, (char) => char.toUpperCase());
};
