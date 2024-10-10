//--------- App ----------//
// Listen for the 'refresh-app' event from the main process
window.api.app.refreshApp((refreshBool) => {
  buildApplication(refreshBool);
});
// Listen for the 'reload-app' event from the main process
window.api.app.reloadApp(() => {
  setStatusContainer("loading", "Creating New Database, please wait...");
});

//--------- Database ----------//
// Listen for the 'set-database' event from the main process
window.api.database.setStatus((data) => {
  setStatus(data);
});

//--------- Services ----------//
// Listen for the 'set-services' event from the main process
window.api.services.setStatus((data) => {
  setStatus(data);
});

//--------- Setting ----------//
// Listen for the 'open-settings' event from the main process
window.api.settings.open(() => {
  openSettings();
});
