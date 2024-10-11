const setStatusContainer = (status, text) => {
  const { statusContainer, tableContainer } = getContainers();

  statusContainer.innerHTML = "";
  statusContainer.style.display = "flex";
  tableContainer.style.display = "none";

  const retryButton = document.createElement("button");
  retryButton.innerHTML = "";
  retryButton.textContent = "Retry"
  retryButton.className = "btn btn-primary btn-lg";
  retryButton.style.display = "block";
  retryButton.addEventListener("click", async () => {
    await buildApplication(true);
  });

  switch (status) {
    case "loading":
      statusContainer.innerHTML = `
        <div class="spinner-border text-light" style="width: 3rem; height: 3rem" role="status"></div>
        <h2 class="text-light">${text}</h2>
      `;
      break;
    case "failed":
      statusContainer.innerHTML = `
        <i class="fa-solid fa-circle-exclamation fa-2xl text-danger"></i>
        <h2 class="text-danger">${text}</h2>
      `;
      statusContainer.append(retryButton);

      break;
    default:
      statusContainer.innerHTML = `
        <i class="fa-solid fa-circle-exclamation fa-2xl text-danger"></i>
        <h2 class="text-danger">Unexpected Error.</h2>
      `;
      statusContainer.append(retryButton);
  }
};
