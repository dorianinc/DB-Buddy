const populateWithWarning = async (databaseExists) => {
  setModalSize("md");

  const title = databaseExists ? "Rebuild Database" : "Build Database";
  const action = databaseExists ? "rebuild your database" : "create a new database";
  const settingsCheck = await hasSettings();
  const alertMessage = settingsCheck
    ? `<strong>Warning:</strong> You are about to ${action} and update your application environment variables.`
    : "Can't proceed until setting configurations filled out.";

  setModalContent(`
    <div class="modal-header">
      <h1 class="modal-title fs-5">${title}</h1>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
  
    <div class="modal-body database">
      <div class="alert alert-warning mt-3">
        ${alertMessage}
      </div>
      
      <p class="note">
        <strong>Note:</strong> This may take a couple of minutes.
      </p>
    </div>
  
    <div class="modal-footer d-flex justify-content-between align-items-center">
      <div id="message-container" style="flex: 1; text-align: center;">
        <span id="message" class="fs-6"></span>
      </div>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-danger" data-bs-dismiss="modal" id="confirm-btn" style="width: 130px; height: 38px;" ${settingsCheck ? "" : "disabled"}>
        <span>Continue</span>
      </button>
    </div>
  `);

  // Add an event listener for the confirm button
  if (settingsCheck) {
    document.querySelector("#confirm-btn").addEventListener("click", async () => {
      await window.api.app.rebuildRender();
    });
  }
};
