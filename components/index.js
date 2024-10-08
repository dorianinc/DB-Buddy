document.addEventListener("DOMContentLoaded", () => {
  buildApplication();
});

const openSettings = () => {
  const myModal = new bootstrap.Modal(document.getElementById("main-modal"));
  openModal("Settings");
  myModal.show();
};

const buildApplication = async (refreshApp = false) => {
  console.log("building application....");
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
    await buildApplication(true);
    retryButton.disabled = false;
  });

  const renderData = await fetchRenderData(statusContainer, refreshApp);

  if (renderData && !isEmpty(renderData.apps)) {
    const database = renderData.database;
    const apps = Object.values(renderData.apps);
    const databaseExists = database.name.length;
    const buttonText = databaseExists ? "Rebuild Database" : "Build Database";

    retryButton.style.display = "none"; 
    statusContainer.style.display = "none";
    table.style.display = "table";
    buildButton.innerText = buttonText;
    buildButton.style.display = "inline";
    buildButton.addEventListener("click", () => {
      openModal("Warning", databaseExists);
    });
    populateTable(table, database, apps);
    
  } else {
    console.log("No Render data");
    retryButton.style.display = "block"; 
    statusContainer.append(retryButton);
  }
};

async function fetchRenderData(statusContainer, refresh) {
  statusContainer.innerHTML = `
    <div class="spinner-border text-light" style="width: 3rem; height: 3rem" role="status"></div>
    <h2 class="text-light">Loading Web Services...</h2>
  `;

  try {
    const fetchDatabase = await window.api.database.getDatabase(refresh);
    const fetchServices = await window.api.services.getServices(refresh);
    
    // Handle both successful fetch and API-level failure
    if (!fetchDatabase.success || !fetchServices.success) {
      throw new Error("Failed to retrieve Render Data");
    }

    return { database: fetchDatabase.payload, apps: fetchServices.payload };
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
