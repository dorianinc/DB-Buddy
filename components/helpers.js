const isEmpty = (obj) => {
  return Object.values(obj).length === 0;
};

const capitalize = (string) => {
  return string.replace(/\b\w/g, (char) => char.toUpperCase());
};

const fetchRenderData = async (refresh) => {
  console.log("fetching render data")
  try {
    const fetchDatabase = await window.api.database.getDatabase(refresh);
    console.log("🖥️  fetchDatabase: ", fetchDatabase)
    const fetchServices = await window.api.services.getServices(refresh);
    console.log("🖥️  fetchServices: ", fetchServices)

    // Handle both successful fetch and API-level failure
    if (!fetchDatabase.success || !fetchServices.success) {
      throw new Error("Failed to retrieve Render Data");
    }

    return { database: fetchDatabase.payload, apps: fetchServices.payload };
  } catch (error) {
    console.error("Error fetching services:", error);
    return null;
  }
};

const getKeyElements = () => {
  const statusContainer = document.querySelector(".status-container");
  const tableContainer = document.querySelector(".table-container");
  const buildButton = document.querySelector("#build-button");

  return { statusContainer, tableContainer, buildButton };
};
