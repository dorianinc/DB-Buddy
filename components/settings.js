const initializeSettings = async () => {
  try {
    const { credentials, password } = await window.api.auth.getLoginInfo();

    // Call function to set up form fields
    setupFormFields(credentials, password);
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeSettings();
});
