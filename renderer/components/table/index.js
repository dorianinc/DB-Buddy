// Function to handle table population
const setTable = (database, apps) => {
  console.log("setting table & hiding statusContainer");
  const databaseExists = database.name.length;
  const buttonText = databaseExists ? "Rebuild Database" : "Build Database";
  const { statusContainer, tableContainer, buildButton } = getKeyElements();

  tableContainer.style.display = "flex";
  statusContainer.style.display = "none";

  buildButton.innerText = buttonText;
  buildButton.style.display = "inline";
  buildButton.addEventListener("click", () => {
    openModal("Warning", databaseExists);
  });

  const tableBody = document.querySelector("#table-body");
  tableBody.innerHTML = "";

  // Function to create a row
  const createRow = (name, type, version = null) => {
    const row = document.createElement("tr");
    row.setAttribute("class", "table-row");

    const nameCell = document.createElement("td");
    nameCell.setAttribute("scope", "row");
    nameCell.textContent = name;

    const statusCell = document.createElement("td");
    statusCell.setAttribute("scope", "row");

    const statusSpan = document.createElement("span");
    statusSpan.setAttribute("class", "status-badge badge text-bg-secondary");
    statusSpan.setAttribute("id", `${name}-status`);
    statusSpan.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Retrieving`;
    statusCell.appendChild(statusSpan);

    const typeCell = document.createElement("td");
    typeCell.textContent = type === "Database" ? `PostgreSQL ${version}` : type;

    row.appendChild(nameCell);
    row.appendChild(statusCell);
    row.appendChild(typeCell);

    return row;
  };

  // Add a row for the database service if it exists
  if (database) {
    const dbRow = createRow(database.name, "Database", database.version);
    tableBody.appendChild(dbRow);
    setStatus(database);
  }

  // Add rows for each app service
  for (const service of Object.values(apps)) {
    const row = createRow(service.name, "Web Service", null);
    tableBody.appendChild(row);
    setStatus(service);
  }
};

const setStatus = async (item) => {
  console.log("🖥️  item in set status: ", item);
  const name = item.name;
  const status = item.status;

  const statusSpan = document.getElementById(`${name}-status`);

  switch (status) {
    case "creating":
    case "deploying":
      statusSpan.setAttribute("class", "status-badge badge text-bg-secondary");
      statusSpan.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> ${capitalize(
        "Retrieving"
      )}`;
      break;
    case "available":
    case "deployed":
      statusSpan.setAttribute("class", "status-badge badge text-bg-success");
      statusSpan.innerHTML = `<i class="fa-solid fa-check" style="color: #ffffff;"></i> ${capitalize(
        status
      )}`;
      break;
    default:
      statusSpan.setAttribute("class", "status-badge badge text-bg-danger");
      statusSpan.innerHTML = `<i class="fa-solid fa-xmark" style="color: #ffffff;"></i> ${capitalize(
        status
      )}`;
  }
};
