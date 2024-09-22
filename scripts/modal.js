// Function to handle modal population
const populateModal = (name, apps) => {
  const app = apps[name];
  const textArea = document.querySelector("#env-text-area");
  textArea.spellcheck = false;

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

