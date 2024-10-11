async function populateSettings() {
  setModalSize("lg");

  setModalContent(`
      <div class="modal-header">
        <h1 class="modal-title fs-5">
          <span id="app-name"></span> Settings Configuration
        </h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body settings">
        <div class="mb-3 row">
          <div class="col">
            <div class="input-label">
              <label for="db-name" class="form-label">Postgres Database Name</label>
              <i class="fa-regular fa-circle-question" style="color: #ffffff;" data-bs-toggle="tooltip" data-bs-placement="top"
              data-bs-custom-class="custom-tooltip"
              data-bs-title="The name of your new Render Postgres database."></i>
            </div>
            <input type="text" class="form-control" id="db-name" placeholder="my-db">
          </div>
          <div class="col">
            <div class="input-label">
              <label for="db-env-key" class="form-label">Postgres Database Env Key</label>
              <i class="fa-regular fa-circle-question" style="color: #ffffff;" data-bs-toggle="tooltip" data-bs-placement="top"
              data-bs-custom-class="custom-tooltip"
              data-bs-title="The name of the database key you use Render applications."></i>
            </div>
            <input type="text" class="form-control" id="db-env-key" placeholder="DATABASE_URL">
          </div>
        </div>
        <div class="mb-3">
          <div class="input-label">
            <label for="api-key" class="form-label">Render API Key</label>
            <i class="fa-regular fa-circle-question" style="color: #ffffff;" data-bs-toggle="tooltip" data-bs-placement="right"
            data-bs-custom-class="custom-tooltip"
            data-bs-title="Your Render API key."></i>
          </div>
          <input type="password" class="form-control" id="api-key" placeholder="rnd_...">
          <button class="btn btn-outline-secondary mt-2" type="button" id="toggle-api-key">Show</button>
        </div>
        <div class="mb-3">
          <div class="input-label">
            <label for="region" class="form-label">Region</label>
            <i class="fa-regular fa-circle-question" style="color: #ffffff;" data-bs-toggle="tooltip" data-bs-placement="right"
            data-bs-custom-class="custom-tooltip"
            data-bs-title="The region you use for your applications."></i>
          </div>
          <select class="form-select" id="region">
            <option value="oregon">Oregon, USA</option>
            <option value="ohio">Ohio, USA</option>
            <option value="virginia">Virginia, USA</option>
            <option value="frankfurt">Frankfurt, Germany</option>
            <option value="singapore">Singapore</option>
          </select>
        </div>

        <!-- Auto Update Checkbox -->
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="auto-update-checkbox">
          <div class="input-label">
            <label class="form-check-label" for="auto-update-checkbox">Enable Auto Update</label>
            <i class="fa-regular fa-circle-question" style="color: #ffffff;" data-bs-toggle="tooltip" data-bs-placement="right"
            data-bs-custom-class="custom-tooltip"
            data-bs-title="Automatically rebuild database every 30 days"></i>
          </div>
        </div>

        <p class="note"><strong>Note:</strong> Ensure all keys and values are correct before saving.</p>
      </div>
      <div class="modal-footer d-flex justify-content-between align-items-center">
        <div id="message-container" style="flex: 1; text-align: center;">
          <span id="message" class="fs-6"></span>
        </div>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="save-settings-btn" style="width: 130px; height: 38px;">
          <span>Save Changes</span>
        </button>
      </div>
  `);

  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Toggle visibility of the API key
  document
    .getElementById("toggle-api-key")
    .addEventListener("click", function () {
      const apiKeyInput = document.getElementById("api-key");
      const isHidden = apiKeyInput.type === "password";
      apiKeyInput.type = isHidden ? "text" : "password";
      this.textContent = isHidden ? "Hide" : "Show";
    });

  const dbNameField = document.querySelector("#db-name");
  const dbKeyField = document.querySelector("#db-env-key");
  const apiKeyField = document.querySelector("#api-key");
  const regionField = document.querySelector("#region");
  const autoUpdateCheckbox = document.querySelector("#auto-update-checkbox");

  // Populate fields with existing settings data
  await populateFieldsWithSettingsData(
    dbNameField,
    dbKeyField,
    apiKeyField,
    regionField,
    autoUpdateCheckbox
  );

  // Handle Save button click
  document
    .querySelector("#save-settings-btn")
    .addEventListener("click", (e) => {
      handleSaveSettings(
        e,
        dbNameField,
        dbKeyField,
        apiKeyField,
        regionField,
        autoUpdateCheckbox
      );
    });
}

async function populateFieldsWithSettingsData(
  dbNameField,
  dbKeyField,
  apiKeyField,
  regionField,
  autoUpdateCheckbox
) {
  try {
    const settingsData = await window.api.settings.getSettings();
    dbNameField.value = settingsData.payload.dbName;
    dbKeyField.value = settingsData.payload.dbKey;
    apiKeyField.value = settingsData.payload.apiKey;
    if (settingsData.payload.region) {
      regionField.value = settingsData.payload.region;
    }
    autoUpdateCheckbox.checked = settingsData.payload.autoUpdate || false;
  } catch (error) {
    console.error("Error populating modal:", error);
    throw error;
  }
}

async function handleSaveSettings(
  e,
  dbNameField,
  dbKeyField,
  apiKeyField,
  regionField,
  autoUpdateCheckbox
) {
  e.preventDefault();
  const saveButton = e.target;
  const dbName = dbNameField.value || null;
  const dbKey = dbKeyField.value || null;
  const apiKey = apiKeyField.value || null;
  const region = regionField.value || null;
  const autoUpdate = autoUpdateCheckbox.checked;

  // Clear any previous messages or icons
  resetMessageAndButton(saveButton);
  saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

  // Perform validation
  const isValidName = validateDatabaseName(dbName);
  const isValidDbKey = validateDatabaseKey(dbKey);
  const isValidApiKey = validateApiKey(apiKey);
  const isValidRegion = validateRegion(region);

  if (!isValidName.success) {
    displayMessage(isValidName.message, false, saveButton);
    return; // Stop execution if validation fails
  }
  if (!isValidDbKey.success) {
    displayMessage(isValidDbKey.message, false, saveButton);
    return; // Stop execution if validation fails
  }
  if (!isValidApiKey.success) {
    displayMessage(isValidApiKey.message, false, saveButton);
    return; // Stop execution if validation fails
  }
  if (!isValidRegion.success) {
    displayMessage(isValidRegion.message, false, saveButton);
    return; // Stop execution if validation fails
  }

  try {
    const saveResponse = await window.api.settings.saveSettings({
      dbName,
      dbKey,
      apiKey,
      region,
      autoUpdate,
    });
    displayMessage(
      saveResponse.success ? "Settings saved!" : "Failed to save setting.",
      saveResponse.success,
      saveButton
    );
  } catch (error) {
    console.error("Error saving settings:", error);
    displayMessage("Failed to save settings", false, saveButton);
  }
}
