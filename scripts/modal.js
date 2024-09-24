let previousHandler = null; // To store the previous handler

const openModal = async (name, apps) => {
  const app = apps[name];
  const textArea = document.querySelector("#env-text-area");

  try {
    const fileData = await window.api.services.getSingleService(app.name);
    textArea.spellcheck = false;
    textArea.value = fileData;
  } catch (error) {
    textArea.value = "";
    console.error("Error populating modal:", error);
    throw error;
  }

  const appNameSpan = document.querySelectorAll("#app-name");
  appNameSpan.forEach((span) => {
    span.innerText = name;
  });

  const button = document.querySelector("#save-env-btn");

  if (previousHandler) {
    button.removeEventListener("click", previousHandler);
  }

  const newSaveHandler = async (e) => {
    e.preventDefault();
    const envValues = textArea.value;
    const message = document.querySelector("#message");

    // Reset message display
    message.style.display = "none";
    message.innerText = "";
    button.innerText = "";
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    `;

    // Call the saveEnv API and handle response with if-else
    const saveToEnv = await window.api.services.saveEnv({
      appName: app.name,
      env: envValues,
    });

    if (saveToEnv.success) {
      setTimeout(() => {
        button.innerHTML = `
          <i class="fa-solid fa-circle-check" style="color: #ffffff;"></i>
        `;
        message.innerText = "Environment variables saved successfully!";
        message.style.display = "block"; // Show the success message
      }, 1500);
    } else {
      setTimeout(() => {
        button.innerHTML = `
          <i class="fa-solid fa-circle-exclamation" style="color: #ffffff;"></i>
        `;
        message.style.color = "red";
        message.innerText = "Failed to save environment variables.";
        message.style.display = "block"; // Show the error message
      }, 1500);
    }
  };

  button.addEventListener("click", newSaveHandler);

  previousHandler = newSaveHandler;
};


