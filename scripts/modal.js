const openModal = async (name, apps, type) => {
  switch (type) {
    case "Web Service":
      await populateWithWebService(name, apps);
      break;
    case "PostgreSQL":
      await populateWithDatabase(name, apps);
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};

async function populateWithWebService(name, apps) {
  const modal = document.querySelector(".modal-dialog");
  modal.classList.remove("modal-sm");
  modal.classList.add("modal-lg");

  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = `
  <div class="modal-header">
    <h1 class="modal-title fs-5">
      <span id="app-name"></span> Service Variables
    </h1>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body service">
    <textarea id="env-text-area" placeholder="ENV variables go here..."></textarea>
    <p class="note">
      Note: Dont include the variable internal database url
    </p>
  </div>
  <div class="modal-footer d-flex justify-content-between align-items-center">
    <div id="message-container" style="flex: 1; text-align: center">
      <span id="message" class=" fs-6"></span>
    </div>
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    <button type="button" class="btn btn-primary" id="save-env-btn" style="width: 130px; height: 38px">
      <span>Save Changes</span>
    </button>
  </div>
`;

  const app = apps[name];
  const textArea = document.querySelector("#env-text-area");
  const appNameSpan = document.querySelector("#app-name");
  appNameSpan.innerText = name;

  try {
    const fileData = await window.api.services.getSingleService(app.name);
    console.log("🖥️  fileData: ", fileData)
    textArea.value = fileData.payload.services;
    textArea.spellcheck = false;
  } catch (error) {
    textArea.value = "";
    console.error("Error populating modal:", error);
    throw error;
  }

  const saveButton = document.querySelector("#save-env-btn");
  const handleClick = async (e) => {
    e.preventDefault();
    const envValues = textArea.value;

    // Reset UI elements
    saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

    // Call saveEnv API
    try {
      const saveResponse = await window.api.services.saveEnv({
        appName: app.name,
        env: envValues,
      });

      if (saveResponse.success) {
        displayMessage(
          "Environment variables saved!",
          true,
          saveButton,
          message
        );
      } else {
        displayMessage(
          "Failed to save environment variables.",
          false,
          saveButton,
          message
        );
      }
    } catch (error) {
      console.error("Error saving environment variables:", error);
      displayMessage(
        "Failed to save environment variables.",
        false,
        saveButton,
        message
      );
    }
  };

  // Add the new event handler
  saveButton.addEventListener("click", handleClick);
}

async function populateWithDatabase(name, apps) {
  const modal = document.querySelector(".modal-dialog");
  modal.classList.remove("modal-lg");
  modal.classList.add("modal-sm");

  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = `
    <div class="modal-header">
      <h1 class="modal-title fs-5">Database</h1>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body database">
      <div id="modal-form">
        <label id="db-name"> 
          <p style="margin: 0px">Name:</p>
          <input type="text" id="name-input" name="name" />
        </label>
        <label id="auto-update">Auto-update
          <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike">
        </label>
      </div>
      <p class="note">
        <strong>Note:</strong> This will be the name used when creating your new database.
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
  `;

  const inputField = document.querySelector("#name-input");

  try {
    const fileData = await window.api.database.getDatabase();
    console.log("🖥️  fileData: ", fileData)
    inputField.value = fileData.payload.name;
    inputField.spellcheck = false;
  } catch (error) {
    inputField.value = "";
    console.error("Error populating modal:", error);
    throw error;
  }

  const saveButton = document.querySelector("#save-env-btn");
  const handleClick = async (e) => {
    e.preventDefault();
    const dbName = inputField.value;

    // Reset UI elements
    saveButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

    // Call saveDatabase
    try {
      const saveResponse = await window.api.database.saveDatabase({
        name: dbName,
        autoUpdate: true,
      });

      if (saveResponse.success) {
        displayMessage(
          "Database details saved!",
          true,
          saveButton,
          message
        );
      } else {
        displayMessage(
          "Failed to save database details",
          false,
          saveButton,
          message
        );
      }
    } catch (error) {
      console.error("Error saving environment variables:", error);
      displayMessage(
        "Failed to save database details",
        false,
        saveButton,
        message
      );
    }
  };

  // Add the new event handler
  saveButton.addEventListener("click", handleClick);
}

function displayMessage(messageText, isSuccess, button, message) {
  setTimeout(() => {
    button.innerHTML = isSuccess
      ? `<i class="fa-solid fa-circle-check" style="color: #ffffff;"></i>`
      : `<i class="fa-solid fa-circle-exclamation" style="color: #ffffff;"></i>`;
    message.innerText = messageText;
    message.style.color = isSuccess ? "white" : "red";
    message.style.display = "block"; // Show the message
  }, 1500);
}
