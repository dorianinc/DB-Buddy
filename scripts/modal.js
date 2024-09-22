let previousHandler = null; // To store the previous handler

const populateModal = async (name, apps) => {
  const app = apps[name];
  const textArea = document.querySelector("#env-text-area");

  try {
    const fileData = await window.api.getSingleService(app.name);
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

  // If there's a previous handler, remove it
  if (previousHandler) {
    button.removeEventListener("click", previousHandler);
  }

  // Define the new handler
  const newSaveHandler = async (e) => {
    e.preventDefault();
    const envValues = textArea.value;
    console.log("🖥️  app.name: ", app.name);
    console.log("🖥️  envValues: ", envValues);

    await window.api.saveEnv({ appName: app.name, env: envValues });
  };

  // Add the new handler
  button.addEventListener("click", newSaveHandler);

  // Store the current handler so it can be removed later
  previousHandler = newSaveHandler;
};
