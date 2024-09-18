// Utility functions for validation
const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const validateUsername = (username) => {
  // Simple username validation: alphanumeric and underscores
  const usernamePattern = /^[a-zA-Z0-9_]+$/;
  return usernamePattern.test(username);
};

const validateCredentials = (value) => {
  if (value === null || value === "") {
    return { isValid: false, message: "Credentials cannot be null or empty." };
  }
  if (value.length < 2 || value.length > 39) {
    return {
      isValid: false,
      message: "Credentials must be between 2 and 39 characters long.",
    };
  }
  if (!validateEmail(value) && !validateUsername(value)) {
    return {
      isValid: false,
      message: "Credentials must be a valid email or username.",
    };
  }
  return { isValid: true, message: "" };
};

const validatePassword = (value) => {
  if (value === null || value === "") {
    return { isValid: false, message: "Password cannot be null or empty." };
  }
  if (value.length < 8 || value.length > 15) {
    return {
      isValid: false,
      message: "Password must be between 8 and 15 characters long.",
    };
  }
  return { isValid: true, message: "" };
};

const setupFormFields = (initialCredentials, initialPassword) => {
  const credentialsField = document.querySelector("#credentials");
  const passwordField = document.querySelector("#password");
  const submitButton = document.querySelector(".login-button");

  if (credentialsField) {
    credentialsField.value = initialCredentials;
    credentialsField.addEventListener("input", () => validateAndToggleButton());
  }

  if (passwordField) {
    passwordField.value = initialPassword;
    passwordField.addEventListener("input", () => validateAndToggleButton());
  }

  if (submitButton) {
    submitButton.addEventListener("click", handleSubmit);
  }

  const validateAndToggleButton = () => {
    const credentials = credentialsField ? credentialsField.value : "";
    const password = passwordField ? passwordField.value : "";

    const credentialsValid = validateCredentials(credentials);
    const passwordValid = validatePassword(password);

    submitButton.disabled = !(
      credentialsValid.isValid && passwordValid.isValid
    );
  };

  // Initial validation to set the button state
  validateAndToggleButton();
};

const handleSubmit = (event) => {
  event.preventDefault(); // Prevent form submission to handle via JavaScript

  const credentials = credentialsField ? credentialsField.value : "";
  const password = passwordField ? passwordField.value : "";

  if (
    validateCredentials(credentials).isValid &&
    validatePassword(password).isValid
  ) {
    console.log("Form submitted with:", {
      credentials,
      password,
    });
    // Add further actions here, e.g., form submission via fetch/axios
  } else {
    console.error("Form is invalid. Please correct the errors.");
  }
};

const initializeSettings = async () => {
  try {
    console.log("in try for initialize settings");
    const { credentials, password } = await window.api.getLoginInfo();

    // Call function to set up form fields
    setupFormFields(credentials, password);
  } catch (error) {
    console.error("Error fetching settings:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeSettings();
  console.log("Modal is ready");
});
