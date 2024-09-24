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
      <p class="note"><strong>Note:</strong> Don't include the variable internal database URL.</p>
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
  saveButton.addEventListener("click", (e) => handleSaveService(e, app, textArea));
}

async function populateWithDatabase() {
  setModalSize("sm");

  setModalContent(`
    <div class="modal-header">
      <h1 class="modal-title fs-5">Database Preferences</h1>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body database">
      <div id="modal-form">
        <label id="db-name">
          <input type="text" id="name-input" name="name" placeholder="Name..." />
        </label>
        <label id="auto-update">Auto-update
          <input type="checkbox" id="auto-update-input" name="auto-update">
        </label>
      </div>
      <p class="note">
        <strong>Note:</strong> This name used when creating your new database.
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

  const inputField = document.querySelector("#name-input");
  const autoUpdateCheckbox = document.querySelector("#auto-update-input");

  await populateDatabaseFields(inputField, autoUpdateCheckbox);

  const saveButton = document.querySelector("#save-env-btn");
  saveButton.addEventListener("click", (e) => handleSaveDatabase(e, inputField, autoUpdateCheckbox));
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

async function populateDatabaseFields(inputField, autoUpdateCheckbox) {
  try {
    const fileData = await window.api.database.getDatabase();
    inputField.value = fileData.payload.name;
    autoUpdateCheckbox.checked = fileData.payload.autoUpdate;
    inputField.spellcheck = false;
  } catch (error) {
    inputField.value = "";
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

  saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

  try {
    const saveResponse = await window.api.services.saveEnv({
      appName: app.name,
      env: envValues,
    });
    displayMessage(
      saveResponse.success ? "Environment variables saved!" : "Failed to save environment variables.",
      saveResponse.success,
      saveButton
    );
  } catch (error) {
    console.error("Error saving environment variables:", error);
    displayMessage("Failed to save environment variables.", false, saveButton);
  }
}

async function handleSaveDatabase(e, inputField, autoUpdateCheckbox) {
  e.preventDefault();
  const saveButton = e.target;
  const dbName = inputField.value;

  saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

  try {
    const saveResponse = await window.api.database.saveDatabase({
      name: dbName,
      autoUpdate: autoUpdateCheckbox.checked,
    });
    displayMessage(
      null,
      saveResponse.success,
      saveButton
    );
  } catch (error) {
    console.error("Error saving database details:", error);
    displayMessage("Failed to save database details.", false, saveButton);
  }
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
