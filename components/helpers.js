const isEmpty = (obj) => {
  return Object.values(obj).length === 0;
};

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
    console.error("Error fetching services:", error);
    return null;
  }
};

const setStatusContainer = (status) => {
  console.log("setting statusContainer & hiding table")
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

  switch (status) {
    case "loading":
      statusContainer.innerHTML = `
      <div class="spinner-border text-light" style="width: 3rem; height: 3rem" role="status"></div>
      <h2 class="text-light">Loading Web Services...</h2>
    `;
      break;
    case "failed":
      statusContainer.innerHTML = `
      <i class="fa-solid fa-circle-exclamation fa-2xl text-danger"></i>
      <h2 class="text-danger">Failed to retrieve Render Data.</h2>
    `;
      break;
    default:
      statusContainer.innerHTML = `
      <i class="fa-solid fa-circle-exclamation fa-2xl text-danger"></i>
      <h2 class="text-danger">Unexpected Error.</h2>
    `;
  }
};
