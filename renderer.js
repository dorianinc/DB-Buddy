// Listen for the 'refresh-services' event from the main process
window.api.services.refreshService((refreshBool) => {
  buildApplication(refreshBool);
});

// Listen for the 'open-settings' event from the main process
window.api.services.setStatus((data) => {
  console.log("🖥️  data in renderer: ", data);
  setStatus(data)
});


// Listen for the 'open-settings' event from the main process
window.api.database.setStatus((data) => {
  console.log("🖥️  data: ", data);
  setStatus(data)
});


// Listen for the 'open-settings' event from the main process
window.api.settings.open(() => {
  openSettings();
});