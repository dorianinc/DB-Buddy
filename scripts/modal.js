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
  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = `
  <div class="modal-header">
    <h1 class="modal-title fs-5">
      <span id="app-name"></span> Service Variables
    </h1>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body">
    <textarea id="env-text-area" placeholder="ENV variables go here..."></textarea>
    <p class="note">
      Note: Copy and paste all variables for <span id="app-name"></span>
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
  const appNameSpan = document.querySelectorAll("#app-name");
  appNameSpan.forEach((span) => {
    span.innerText = name;
  });


  try {
    const fileData = await window.api.services.getSingleService(app.name);
    textArea.value = fileData;
    textArea.spellcheck = false;
  } catch (error) {
    textArea.value = "";
    console.error("Error populating modal:", error);
    throw error;
  }

  appNameSpan.innerText = name;

  const saveButton = document.querySelector("#save-env-btn");

  const handleClick = async (e) => {
    e.preventDefault();
    const envValues = textArea.value;
    // const message = document.querySelector("#message");

    // Reset UI elements
    message.style.display = "none";
    message.innerText = "tset";
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

function displayMessage(messageText, isSuccess, button, message) {
  console.log("in display message");
  setTimeout(() => {
    button.innerHTML = isSuccess
      ? `<i class="fa-solid fa-circle-check" style="color: #ffffff;"></i>`
      : `<i class="fa-solid fa-circle-exclamation" style="color: #ffffff;"></i>`;

    console.log("🖥️  messageText: ", messageText);
    message.innerText = messageText;
    message.style.color = isSuccess ? "white" : "red";
    message.style.display = "block"; // Show the message
  }, 1500);
}

async function populateWithDatabase() {
  // Logic for populating with PostgreSQL (if applicable)
}
