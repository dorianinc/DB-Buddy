const fetchRenderData = async (refresh) => {
  try {
    const fetchDatabase = await window.api.database.getDatabase(refresh);
    const fetchServices = await window.api.services.getServices(refresh);

    // Handle both successful fetch and API-level failure
    if (!fetchDatabase.success || !fetchServices.success) {
      throw new Error("Failed to retrieve Render Data");
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

const isEmpty = (obj) => {
  if (obj == null) return true;
  return Object.values(obj).length === 0;
};

const capitalize = (string) => {
  return string.replace(/\b\w/g, (char) => char.toUpperCase());
};
