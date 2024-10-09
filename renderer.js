// Listen for the 'refresh-app' event from the main process
window.api.app.refreshApp((refreshBool) => {
  buildApplication(refreshBool);
});

// Listen for the 'set-services' event from the main process
// window.api.services.setStatus((data) => {
//   setStatus(data)
// });


// Listen for the 'set-database' event from the main process
// window.api.database.setStatus((data) => {
//   setStatus(data)
// });


// Listen for the 'open-settings' event from the main process
window.api.settings.open(() => {
  console.log("triggering open-settings listener")
  openSettings();
});