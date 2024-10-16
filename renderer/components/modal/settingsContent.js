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
        <div class="input-group">
          <input type="password" class="form-control" id="api-key" placeholder="rnd_...">
          <button class="btn btn-outline-secondary" type="button" id="toggle-api-key">Show</button>
        </div>
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

<div class="row mb-3 d-flex">
  <!-- Left side: Enable Auto Update -->
  <div class="col d-flex justify-content-start">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="auto-update-checkbox">
      <div class="input-label">
        <label class="form-check-label" for="auto-update-checkbox">Enable Auto Update</label>
        <i class="fa-regular fa-circle-question" style="color: #ffffff;" data-bs-toggle="tooltip" data-bs-placement="right"
        data-bs-custom-class="custom-tooltip"
        data-bs-title="Automatically rebuild database every 30 days"></i>
      </div>
    </div>
  </div>

  <!-- Right side: Launch on Startup and Start Minimized -->
  <div class="col d-flex flex-column align-items-start" style="gap: 10px;">
    <!-- Launch on Startup -->
    <div class="form-check mb-2">
      <input class="form-check-input" type="checkbox" id="launch-startup-checkbox">
      <div class="input-label">
        <label class="form-check-label" for="launch-startup-checkbox">Launch on Startup</label>
        <i class="fa-regular fa-circle-question" style="color: #ffffff;" data-bs-toggle="tooltip" data-bs-placement="right"
        data-bs-custom-class="custom-tooltip"
        data-bs-title="Start DB Buddy automatically when the system starts."></i>
      </div>
    </div>

    <!-- Start Minimized -->
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="start-minimized-checkbox">
      <div class="input-label">
        <label class="form-check-label" for="start-minimized-checkbox">Minimize to Tray</label>
        <i class="fa-regular fa-circle-question" style="color: #ffffff;" data-bs-toggle="tooltip" data-bs-placement="right"
        data-bs-custom-class="custom-tooltip"
        data-bs-title="Launch DB Buddy minimized to the System Tray"></i>
      </div>
    </div>
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
  [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  document.getElementById("toggle-api-key").addEventListener("click", () => {
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
  const autoLaunchCheckbox = document.querySelector("#launch-startup-checkbox");
  const launchMinimizedCheckbox = document.querySelector(
    "#start-minimized-checkbox"
  );

  autoLaunchCheckbox.addEventListener("click", () => {
    if (autoLaunchCheckbox.checked === true) {
      launchMinimizedCheckbox.disabled = false;
    } else {
      launchMinimizedCheckbox.disabled = true;
    }
  });

  await populateFieldsWithSettingsData(
    dbNameField,
    dbKeyField,
    apiKeyField,
    regionField,
    autoUpdateCheckbox,
    autoLaunchCheckbox,
    launchMinimizedCheckbox
  );

  document
    .querySelector("#save-settings-btn")
    .addEventListener("click", (e) => {
      handleSaveSettings(
        e,
        dbNameField,
        dbKeyField,
        apiKeyField,
        regionField,
        autoUpdateCheckbox,
        autoLaunchCheckbox,
        launchMinimizedCheckbox 
      );
    });
}

async function populateFieldsWithSettingsData(
  dbNameField,
  dbKeyField,
  apiKeyField,
  regionField,
  autoUpdateCheckbox,
  autoLaunchCheckbox,
  launchMinimizedCheckbox
) {
  try {
    const settingsData = await window.api.settings.getSettings();
    dbNameField.value = settingsData.payload.dbName;
    dbKeyField.value = settingsData.payload.dbKey;
    apiKeyField.value = settingsData.payload.apiKey;
    regionField.value = settingsData.payload.region || "";
    autoUpdateCheckbox.checked = settingsData.payload.autoUpdate || false;
    autoLaunchCheckbox.checked = settingsData.payload.autoLaunch || false;

    if (autoLaunchCheckbox.checked) {
      launchMinimizedCheckbox.disabled = false;
    } else {
      launchMinimizedCheckbox.disabled = true;
    }
    launchMinimizedCheckbox.checked =
      settingsData.payload.launchMinimized || false;
  } catch (error) {
    console.error("Error populating modal:", error);
  }
}

async function handleSaveSettings(
  e,
  dbNameField,
  dbKeyField,
  apiKeyField,
  regionField,
  autoUpdateCheckbox,
  autoLaunchCheckbox,
  launchMinimizedCheckbox
) {
  e.preventDefault();
  const saveButton = e.target;

  const dbName = dbNameField.value || null;
  const dbKey = dbKeyField.value || null;
  const apiKey = apiKeyField.value || null;
  const region = regionField.value || null;
  const autoUpdate = autoUpdateCheckbox.checked
  const autoLaunch = autoLaunchCheckbox.checked;
  const launchMinimized = launchMinimizedCheckbox.checked;

  resetMessageAndButton(saveButton);

  saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Saving...`;

  if (!dbName || !dbKey || !apiKey) {
    displayMessage("Please fill in all required fields.", false, saveButton);
    return;
  }

  try {
    const saveResponse = await window.api.settings.saveSettings({
      dbName,
      dbKey,
      apiKey,
      region,
      autoUpdate,
      autoLaunch,
      launchMinimized,
    });

    if (saveResponse.success) {
      displayMessage("Settings saved successfully!", true, saveButton);
    } else {
      displayMessage("Failed to save settings.", false, saveButton);
    }
  } catch (error) {
    console.error("Error saving settings:", error);
    displayMessage(
      "Error saving settings. Please try again.",
      false,
      saveButton
    );
  }
}

function validateDatabaseName(name) {
  if (name === null || !name.length) {
    return {
      success: false,
      message: "Name is required",
    };
  }
  const nameRegex = /^(?![_-])[a-zA-Z0-9_-]+(?<![_-])$/;
  if (!nameRegex.test(name)) {
    return {
      success: false,
      message: "Invalid name",
    };
  }

  return { success: true };
}

function validateDatabaseKey(key) {
  if (key === null || !key.length) {
    return {
      success: false,
      message: "Env Key is required",
    };
  }
  const keyRegex = /^[A-Z0-9_]+$/;
  if (!keyRegex.test(key)) {
    return {
      success: false,
      message: "Invalid env key",
    };
  }

  return { success: true };
}

function validateRegion(region) {
  if (region === null || !region.length) {
    return {
      success: false,
      message: "Region is required",
    };
  }
  const validRegions = ["oregon", "ohio", "virginia", "frankfurt", "singapore"];
  if (!validRegions.includes(region)) {
    return {
      success: false,
      message: "Invalid region",
    };
  }

  return { success: true };
}

function validateApiKey(key) {
  if (key === null || !key.length) {
    return {
      success: false,
      message: "API key is required",
    };
  }
  if (!key.startsWith("rnd_")) {
    return {
      success: false,
      message: "Invalid API key",
    };
  }

  return { success: true };
}
