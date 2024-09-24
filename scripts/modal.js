const openModal = async (name, apps, type) => {
  switch (type) {
    case "Web Service":
      await populateWithWebService(name, apps);
      break;
    case "PostgreSQL":
      await populateWithDatabase();
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};

async function populateWithWebService(name, apps) {
  setModalSize("lg");

  setModalContent(`
    <div class="modal-header">
      <h1 class="modal-title fs-5">
        <span id="app-name"></span> Service Variables
      </h1>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body service">
      <textarea id="env-text-area" placeholder="ENV variables go here..."></textarea>
      <p class="note"><strong>Note:</strong> Don't include the variable internal database URL, and wrap values in double qoutes.</p>
    </div>
    <div class="modal-footer d-flex justify-content-between align-items-center">
      <div id="message-container" style="flex: 1; text-align: center">
        <span id="message" class="fs-6"></span>
      </div>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary" id="save-env-btn" style="width: 130px; height: 38px">
        <span>Save Changes</span>
      </button>
    </div>
  `);

  const app = apps[name];
  const textArea = document.querySelector("#env-text-area");
  document.querySelector("#app-name").innerText = name;

  await populateTextAreaWithServiceData(app, textArea);

  const saveButton = document.querySelector("#save-env-btn");
  saveButton.addEventListener("click", (e) =>
    handleSaveService(e, app, textArea)
  );
}

async function populateWithDatabase() {
  setModalSize("md");

  setModalContent(`
    <div class="modal-header">
      <h1 class="modal-title fs-5">Database Preferences</h1>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body database">
      <div id="modal-form">
          <label id="db-name">
          Internal database key
          <input type="text" id="db-key-input" name="db-key" placeholder="Ex: DATABASE_URL" />
        </label>
        <label id="db-name">
        Database name
          <input type="text" id="db-name-input" name="db-name" placeholder="Ex: my-db" />
        </label>
        <label id="auto-update">Auto-update
          <input type="checkbox" id="auto-update-input" name="auto-update">
        </label>
      </div>
      <p class="note">
        <strong>Note:</strong> These values will be used when creating your new db.
      </p>
    </div>
    <div class="modal-footer d-flex justify-content-between align-items-center">
      <div id="message-container" style="flex: 1; text-align: center">
        <span id="message" class="fs-6"></span>
      </div>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      <button type="button" class="btn btn-primary" id="save-env-btn" style="width: 130px; height: 38px">
        <span>Save Changes</span>
      </button>
    </div>
  `);

  const nameField = document.querySelector("#db-name-input");
  const keyField = document.querySelector("#db-key-input");
  const autoUpdateCheckbox = document.querySelector("#auto-update-input");

  await populateDatabaseFields(nameField, keyField, autoUpdateCheckbox);

  const saveButton = document.querySelector("#save-env-btn");
  saveButton.addEventListener("click", (e) =>
    handleSaveDatabase(e, nameField, keyField, autoUpdateCheckbox)
  );
}

async function populateTextAreaWithServiceData(app, textArea) {
  try {
    const fileData = await window.api.services.getSingleService(app.name);
    textArea.value = fileData.payload.services;
    textArea.spellcheck = false;
  } catch (error) {
    textArea.value = "";
    console.error("Error populating modal:", error);
    throw error;
  }
}

async function populateDatabaseFields(nameField, keyField, autoUpdateCheckbox) {
  try {
    const fileData = await window.api.database.getDatabase();
    console.log("🖥️  fileData: ", fileData);
    nameField.value = fileData.payload.name;
    keyField.value = fileData.payload.key;
    autoUpdateCheckbox.checked = fileData.payload.autoUpdate;
    nameField.spellcheck = false;
    keyField.spellcheck = false;
  } catch (error) {
    nameField.value = "";
    keyField.value = "";
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

async function handleSaveService(e, app, textArea) {
  e.preventDefault();
  const saveButton = e.target;
  const envValues = textArea.value;

  // Clear any previous messages or icons
  resetMessageAndButton(saveButton);
  saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

  // Perform validation
  console.log("🖥️  envValues : ", envValues);
  console.log("🖥️  envValues !== null: ", envValues !== null);
  const isEnvValid = validateEnvVariables(envValues);
  console.log("🖥️  isEnvValid: ", isEnvValid);

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

// Function to validate ENV variables format
function validateEnvVariables(envString) {
  if (envString === null || !envString.length) {
    return {
      success: false,
      message: "ENV values are required",
    };
  }

  // Split the input into lines
  const lines = envString.split("\n");

  // Regex: matches valid ENV format like KEY="VALUE"
  const envRegex = /^[A-Z0-9_]+="[^"]*"$/;

  // Loop through each line and validate
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim(); // Trim any extra spaces

    // Skip empty lines (allow multi-line ENV files)
    if (trimmedLine === "") continue;

    // Check if the line matches the ENV variable pattern
    if (!envRegex.test(trimmedLine)) {
      console.log(`Invalid ENV on line ${i + 1}:`, line); // Log the line number (1-based index)

      // Return an object with success as false and the invalid line number
      return {
        success: false,
        message: `Invalid ENV format at line ${i + 1}`,
      };
    }
  }

  return { success: true }; // All lines are valid
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
