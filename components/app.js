document.addEventListener("DOMContentLoaded", () => {
  buildApplication();
});

const buildApplication = async (refreshApp = false) => {
  setStatusContainer("loading");
  const renderData = await fetchRenderData(refreshApp);
  if (renderData && !isEmpty(renderData.apps)) {
    const database = renderData.database;
    const apps = Object.values(renderData.apps);
    setTable(database, apps);
  } else {
    retryButton.style.display = "block";
    statusContainer.append(retryButton);
  }
};

const openSettings = () => {
  const myModal = new bootstrap.Modal(document.getElementById("main-modal"));
  openModal("Settings");
  myModal.show();
};
