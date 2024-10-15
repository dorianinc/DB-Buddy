const openModal = (type, databaseExists) => {
  switch (type) {
    case "Settings":
      populateSettings();
      break;
    case "Warning":
      populateWithWarning(databaseExists);
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};

function setModalSize(size) {
  const modal = document.querySelector(".modal-dialog");
  modal.classList.remove("modal-sm", "modal-lg");
  modal.classList.add(`modal-${size}`);
}

function setModalContent(content) {
  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = content;
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

function resetMessageAndButton(button) {
  const message = document.querySelector("#message");
  button.innerHTML = "";
  message.innerText = "";
  message.style.display = "none";
}
