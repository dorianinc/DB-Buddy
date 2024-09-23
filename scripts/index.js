document.addEventListener("DOMContentLoaded", () => {
  startApplication();
});

const startApplication = async () => {
  const statusContainer = document.querySelector(".status-container");
  const retryButton = document.createElement("button");
  retryButton.className = "btn btn-primary";
  retryButton.innerText = "Retry";
  retryButton.style.display = "none"; // Start hidden

  retryButton.addEventListener("click", async () => {
    retryButton.disabled = true;
    await startApplication();
    retryButton.disabled = false;
  });

  const serviceData = await fetchServiceData(statusContainer);

  if (!serviceData) {
    retryButton.style.display = "block"; // Show button if fetch fails
    statusContainer.append(retryButton);
  } else {
    retryButton.style.display = "none"; // Hide button if fetch is successful
  }
};

async function fetchServiceData(statusContainer, retryButton) {
  statusContainer.innerHTML = `
    <div class="spinner-border text-light" style="width: 3rem; height: 3rem" role="status"></div>
    <h2 class="text-light">Loading Web Services...</h2>
  `;

  const table = document.getElementById("servicesTable");
  table.style.display = "none";

  try {
    const fetchServices = await window.api.getServices();

    // Handle both successful fetch and API-level failure
    if (!fetchServices.success) {
      throw new Error("Failed to retrieve Render Data");
    }

    const database = fetchServices.payload.database;
    const apps = fetchServices.payload.apps;

    populateTable(table, database, apps);
    statusContainer.style.display = "none";
    table.style.display = "table";
    return true;

  } catch (error) {
    console.error("Error fetching services:", error);
    statusContainer.innerHTML = `
      <i class="fa-solid fa-circle-exclamation fa-2xl text-danger"></i>
      <h2 class="text-danger">Failed to retrieve Render Data.</h2>
    `;
    return false;
  }
}