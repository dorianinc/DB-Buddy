

// Function to handle modal population
const populateModal = async (name, apps) => {
  const app = apps[name];
  const textArea = document.querySelector("#env-text-area");
  try {
    const fileData = await window.api.getSingleService(app.name);
    console.log("🖥️  fileData: ", fileData);
    textArea.spellcheck = false;
    console.log("there is data");
    textArea.value = fileData;
  } catch (error) {
    console.log("there is no data");
    textArea.value = "";
    textArea.innerText = "";
    console.error("Error populating modal:", error);
    throw error;
  }

  const appNameSpan = document.querySelectorAll("#app-name");
  appNameSpan.forEach((span) => {
    span.innerText = name;
  });

  const button = document.querySelector("#save-env-btn");

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    const envValues = textArea.value;
    console.log("🖥️  envValues: ", envValues);

    await window.api.saveEnv({ appName: app.name, env: envValues });
  });
};
