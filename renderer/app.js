document.addEventListener("DOMContentLoaded", () => {
  startApplication();
});

const startApplication = async () => {
  // check to see if settings are configured
  if (await hasSettings()) {
    // if they are, we proceed
    setStatusContainer("loading", "Loading Web Services...");
    buildApplication();
  } else {
    // if they aren't, we notifty user
    requestSetup();
  }
};

const buildApplication = async (refreshApp = false) => {
  const renderData = await fetchRenderData(refreshApp);

  // check to see if there is render data
  if (renderData && !isEmpty(renderData.apps)) {
    // if there is service/appliction data we proceed
    const database = renderData.database;
    const apps = Object.values(renderData.apps);
    setTable(database, apps);
  } else {
    // if there are no services/applications we throw an error message
    setStatusContainer("failed", "Failed to service data from Render");
  }
};

const openSettings = () => {
  const myModal = new bootstrap.Modal(document.getElementById("main-modal"));
  openModal("Settings");
  myModal.show();
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
