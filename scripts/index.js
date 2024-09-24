document.addEventListener("DOMContentLoaded", () => {
  startApplication();
});

const startApplication = async (refreshApp = false) => {
  console.log("starting application....");
  const statusContainer = document.querySelector(".status-container");
  statusContainer.style.display = "flex";

  const table = document.getElementById("services-table");
  table.style.display = "none";

  const buildButton = document.getElementById("build-button");
  buildButton.style.display = "none";

  const retryButton = document.createElement("button");
  retryButton.className = "btn btn-primary";
  retryButton.innerText = "Retry";
  retryButton.style.display = "none";

  retryButton.addEventListener("click", async () => {
    retryButton.disabled = true;
    await startApplication(true);
    retryButton.disabled = false;
  });

  const serviceData = await fetchServiceData(statusContainer, refreshApp);

  if (serviceData && !isEmpty(serviceData.payload.apps)) {
    const database = serviceData.payload.database;
    const apps = serviceData.payload.apps;

    retryButton.style.display = "none"; // Hide button if fetch is successful
    statusContainer.style.display = "none";
    table.style.display = "table";
    buildButton.innerText = database.name
      ? "Rebuild Database"
      : "Build Database";
    buildButton.style.display = "inline";
    populateTable(table, database, apps);
  } else {
    console.log("no service data");
    retryButton.style.display = "block"; // Show button if fetch fails
    statusContainer.append(retryButton);
  }
};

async function fetchServiceData(statusContainer, refresh) {
  statusContainer.innerHTML = `
    <div class="spinner-border text-light" style="width: 3rem; height: 3rem" role="status"></div>
    <h2 class="text-light">Loading Web Services...</h2>
  `;

  try {
    const fetchServices = await window.api.services.getServices(refresh);

    // Handle both successful fetch and API-level failure
    if (!fetchServices.success) {
      throw new Error("Failed to retrieve Render Data");
    }
    return fetchServices;
  } catch (error) {
    console.error("Error fetching services:", error);
    statusContainer.innerHTML = `
      <i class="fa-solid fa-circle-exclamation fa-2xl text-danger"></i>
      <h2 class="text-danger">Failed to retrieve Render Data.</h2>
    `;
    return null;
  }
}

function isEmpty(obj) {
  return Object.values(obj).length === 0;
}
