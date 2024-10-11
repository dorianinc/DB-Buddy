document.addEventListener("DOMContentLoaded", async () => {
  if (await hasSettings()) {
    console.log("has data");
    setStatusContainer("loading", "Loading Web Services...");
    buildApplication();
  } else {
    console.log("has not data");

    requestSetup();
  }
});

const buildApplication = async (refreshApp = false) => {
  const renderData = await fetchRenderData(refreshApp);
  if (renderData && !isEmpty(renderData.apps)) {
    const database = renderData.database;
    const apps = Object.values(renderData.apps);
    setTable(database, apps);
  } else {
    setStatusContainer("failed");
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
