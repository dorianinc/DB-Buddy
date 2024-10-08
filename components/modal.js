const openModal = (type, databaseExists) => {
  switch (type) {
    case "Settings":
      populateSettings();
      break;
    case "Warning":
      populateWithWarning(databaseExists);
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};

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
          <label for="db-name" class="form-label">Database Name</label>
          <input type="text" class="form-control" id="db-name" placeholder="Enter database name">
        </div>
        <div class="col">
          <label for="db-env-key" class="form-label">Database Env Key</label>
          <input type="text" class="form-control" id="db-env-key" placeholder="Enter database env key">
        </div>
      </div>
      <div class="mb-3">
        <label for="api-key" class="form-label">Render API Key</label>
        <input type="password" class="form-control" id="api-key" placeholder="Enter Render API key">
        <button class="btn btn-outline-secondary mt-2" type="button" id="toggle-api-key">Show</button>
      </div>
      <div class="mb-3">
        <label for="region" class="form-label">Region</label>
        <select class="form-select" id="region">
          <option value="oregon">Oregon, USA</option>
          <option value="ohio">Ohio, USA</option>
          <option value="virginia">Virginia, USA</option>
          <option value="frankfurt">Frankfurt, Germany</option>
          <option value="singapore">Singapore</option>
        </select>
      </div>
      <p class="note"><strong>Note:</strong> Ensure all keys and values are correct before saving.</p>
    </div>
    <div class="modal-footer d-flex justify-content-between align-items-center">
      <div id="message-container" style="flex: 1; text-align: center">
        <span id="message" class="fs-6"></span>
      </div>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary" id="save-settings-btn" style="width: 130px; height: 38px">
        <span>Save Changes</span>
      </button>
    </div>
  `);

  // Toggle visibility for the API key
  document
    .getElementById("toggle-api-key")
    .addEventListener("click", function () {
      const apiKeyInput = document.getElementById("api-key");

      // Toggle the input type
      if (apiKeyInput.type === "password") {
        apiKeyInput.type = "text";
        this.textContent = "Hide";
      } else {
        apiKeyInput.type = "password";
        this.textContent = "Show";
      }
    });

  const dbNameField = document.querySelector("#db-name");
  const dbKeyField = document.querySelector("#db-env-key");
  const apiKeyField = document.querySelector("#api-key");
  const regionField = document.querySelector("#region");

  // Optionally populate fields with existing data if necessary
  await populateFieldsWithSettingsData(
    dbNameField,
    dbKeyField,
    apiKeyField,
    regionField
  );

  const saveButton = document.querySelector("#save-settings-btn");
  saveButton.addEventListener("click", (e) =>
    handleSaveSettings(e, dbNameField, dbKeyField, apiKeyField, regionField)
  );
}

function populateWithWarning(databaseExists) {
  setModalSize("md");

  setModalContent(`
<div class="modal-header">
  <h1 class="modal-title fs-5">${
    databaseExists ? "Rebuild Database" : "Build Database"
  }</h1>
  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
</div>

<div class="modal-body database">
  <div class="alert alert-warning mt-3">
    <strong>Warning:</strong> You are about to ${
      databaseExists ? "rebuild your database" : "create a new database"
    } and update your application environment variables.
  </div>
  
  <p class="note">
    <strong>Note: The may take a couple of minutes.</strong> 
  </p>
</div>

<div class="modal-footer d-flex justify-content-between align-items-center">
  <div id="message-container" style="flex: 1; text-align: center">
    <span id="message" class="fs-6"></span>
  </div>
  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
  <button type="button" class="btn btn-danger" data-bs-dismiss="modal" id="confirm-btn"
   style="width: 130px; height: 38px">
    <span>Continue</span>
  </button>
</div>

  `);

  const confirmButton = document.querySelector("#confirm-btn");
  confirmButton.addEventListener("click", (e) => buildApplication(true));
}

async function populateFieldsWithSettingsData(
  dbNameField,
  dbKeyField,
  apiKeyField,
  regionField
) {
  try {
    const settingsData = await window.api.settings.getSettings();
    dbNameField.value = settingsData.payload.dbName;
    dbKeyField.value = settingsData.payload.dbKey;
    apiKeyField.value = settingsData.payload.apiKey;
    if (settingsData.payload.region) {
      regionField.value = settingsData.payload.region;
    }
  } catch (error) {
    // textArea.value = "";
    console.error("Error populating modal:", error);
    throw error;
  }
}

function setModalSize(size) {
  const modal = document.querySelector(".modal-dialog");
  modal.classList.remove("modal-sm", "modal-lg");
  modal.classList.add(`modal-${size}`);
}

function setModalContent(content) {
  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = content;
}

async function handleSaveSettings(
  e,
  dbNameField,
  dbKeyField,
  apiKeyField,
  regionField
) {
  e.preventDefault();
  const saveButton = e.target;
  const dbName = dbNameField.value || null;
  const dbKey = dbKeyField.value || null;
  const apiKey = apiKeyField.value || null;
  const region = regionField.value || null;

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

// Validation for the database name
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

// Validation for the database key
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

// Validation for the region
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

// Validation for the region
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

function displayMessage(messageText, isSuccess, button) {
  const message = document.querySelector("#message");
  setTimeout(() => {
    button.innerHTML = isSuccess
      ? `<i class="fa-solid fa-circle-check" style="color: #ffffff;"></i>`
      : `<i class="fa-solid fa-circle-exclamation" style="color: #ffffff;"></i>`;
    message.innerText = messageText;
    message.style.color = isSuccess ? "white" : "red";
    message.style.display = "block";
  }, 1500);
}

// Function to reset the message and button state before showing new feedback
function resetMessageAndButton(button) {
  const message = document.querySelector("#message");
  button.innerHTML = ""; // Clear any existing icon on the button
  message.innerText = ""; // Clear the message
  message.style.display = "none"; // Hide the message until next update
}
