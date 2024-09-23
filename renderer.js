
// Listen for the 'refresh-services' event from the main process
window.api.services.refreshService(() => {
    startApplication(true);
  });