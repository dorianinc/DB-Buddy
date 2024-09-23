
// Listen for the 'refresh-services' event from the main process
window.api.refreshService((message) => {
  console.log("Received message from main process:", message);
  startApplication(true);
});
