document.addEventListener("DOMContentLoaded", () => {
  startApplication();
});

const startApplication = async () => {
  if (await hasSettings()) {
    setStatusContainer("loading", "Loading Web Services...");
    buildApplication();
  } else {
    setStatusContainer("setup", "Use 'CmdOrCtrl+Shift+S' for a shortcut.");
  }
};

const buildApplication = async (refreshApp = false) => {
  try {
    const renderData = await fetchRenderData(refreshApp);
    if (renderData && !isEmpty(renderData.apps)) {
      const database = renderData.database;
      const apps = Object.values(renderData.apps);
      setTable(database, apps);
    } else {
      setStatusContainer("failed", "Failed to service data from Render");
    }
  } catch (error) {
    setStatusContainer("failed", error);
  }
};

const openSettings = () => {
  const myModal = new bootstrap.Modal(document.getElementById("main-modal"));
  openModal("Settings");
  myModal.show();
};

const checkAutoUpdater = async (creationDate) => {
  await window.api.app.checkDaysRemaining(creationDate);
};
