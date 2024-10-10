document.addEventListener("DOMContentLoaded", () => {
  setStatusContainer("loading", "Loading Web Services...");
  buildApplication();
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
