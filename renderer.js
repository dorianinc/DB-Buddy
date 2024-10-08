// Listen for the 'refresh-services' event from the main process
window.api.services.refreshService(() => {
  buildApplication(true);
});

// Listen for the 'open-settings' event from the main process
window.api.settings.open(() => {
  openSettings();
});
