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
    setStatusContainer("setup", "Use 'CmdOrCtrl+Shift+S' for a shortcut.");
  }
};

const buildApplication = async (refreshApp = false) => {
  try {
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
  } catch (error) {
    // if there are no services/applications we throw an error message
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
