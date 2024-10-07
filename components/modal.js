const openModal = async (name, apps, type) => {
  switch (type) {
    case "Settings":
      await populateSettings();
      break;
    case "Warning":
      populateWithWarning(name);
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};



async function populateSettings() {
  setModalSize("lg")

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
        <label for="render-api-key" class="form-label">Render API Key</label>
        <input type="password" class="form-control" id="render-api-key" placeholder="Enter Render API key">
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
  document.getElementById('toggle-api-key').addEventListener('click', function() {
    const apiKeyInput = document.getElementById('render-api-key');
    
    // Toggle the input type
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      this.textContent = 'Hide';
    } else {
      apiKeyInput.type = 'password';
      this.textContent = 'Show';
    }
  });
  
  

  // Optionally populate fields with existing data if necessary
  // await populateFieldsWithSettingsData(app);

  const saveButton = document.querySelector("#save-settings-btn");
  // saveButton.addEventListener("click", (e) =>
  //   handleSaveSettings(e, app)
  // );
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

async function handleSaveSettings(e, app, textArea) {
  e.preventDefault();
  const saveButton = e.target;
  const envValues = textArea.value;

  // Clear any previous messages or icons
  resetMessageAndButton(saveButton);
  saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

  // Perform validation

  if (!isEnvValid.success) {
    displayMessage(isEnvValid.message, false, saveButton);
    return; // Stop execution if validation fails
  }

  try {
    const saveResponse = await window.api.services.saveEnv({
      appName: app.name,
      env: envValues,
    });
    displayMessage(
      saveResponse.success
        ? "Environment variables saved!"
        : "Failed to save environment variables.",
      saveResponse.success,
      saveButton
    );
  } catch (error) {
    console.error("Error saving environment variables:", error);
    displayMessage("Failed to save environment variables.", false, saveButton);
  }
}

async function handleSaveDatabase(e, nameField, keyField, autoUpdateCheckbox) {
  e.preventDefault();
  const saveButton = e.target;
  const dbName = nameField.value || null;
  const dbKey = keyField.value || null;

  // Clear previous messages or icons
  resetMessageAndButton(saveButton);
  saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

  // Perform validation
  const validateKey = validateDatabaseKey(dbKey);
  const validateName = validateDatabaseName(dbName);

  // If validation fails, show error messages and stop execution
  if (!validateKey.success) {
    displayMessage(validateKey.message, false, saveButton);
    return;
  }

  if (!validateName.success) {
    displayMessage(validateName.message, false, saveButton);
    return;
  }

  try {
    const saveResponse = await window.api.database.saveDatabase({
      name: dbName,
      key: dbKey,
      autoUpdate: autoUpdateCheckbox.checked,
    });
    displayMessage(
      "Successfully saved database details.",
      saveResponse.success,
      saveButton
    );
  } catch (error) {
    console.error("Error saving database details:", error);
    displayMessage("Failed to save database details.", false, saveButton);
  }
}


// Validation for the database key
function validateDatabaseKey(key) {
  if (key === null || !key.length) {
    return {
      success: false,
      message: "Key is required",
    };
  }
  const keyRegex = /^[A-Z0-9_]+$/;
  if (!keyRegex.test(key)) {
    return {
      success: false,
      message: "Invalid name",
    };
  }

  return { success: true };
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
