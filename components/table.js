// Function to handle table population
const populateTable = (table, database, apps) => {
  const tableBody = table.querySelector("tbody");
  tableBody.innerHTML = "";

  // Function to create a row
  const createRow = (name, status, type, version = null, lastDeployed) => {
    const row = document.createElement("tr");
    row.setAttribute("class", "table-row");

    const nameCell = document.createElement("td");
    nameCell.setAttribute("scope", "row");
    nameCell.textContent = name;

    const statusCell = document.createElement("td");
    statusCell.setAttribute("scope", "row");

    const statusSpan = document.createElement("span");
    statusSpan.setAttribute("class", "status-badge badge text-bg-secondary");
    statusSpan.setAttribute("id", `${name}-status`); // Use original name directly
    statusSpan.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Deploying`;
    statusCell.appendChild(statusSpan);

    const typeCell = document.createElement("td");
    typeCell.textContent = type === "Database" ? `PostgreSQL ${version}` : type;

    const lastDeployedCell = document.createElement("td");
    lastDeployedCell.textContent = lastDeployed;

    row.appendChild(nameCell);
    row.appendChild(statusCell);
    row.appendChild(typeCell);
    row.appendChild(lastDeployedCell);

    return row;
  };

  // Add a row for the database service if it exists
  if (database) {
    const dbRow = createRow(
      database.name,
      database.status,
      "Database",
      database.version,
      database.lastDeployed
    );
    tableBody.appendChild(dbRow);
    setDatabaseStatus(database); // Update status after appending to the DOM
  }

  // Add rows for each app service
  for (const service of Object.values(apps)) {
    const row = createRow(
      service.name,
      service.status,
      "Web Service",
      null,
      service.lastDeployed
    );
    tableBody.appendChild(row); // Append to the DOM first
    setServiceStatus(service); // Update status after appending to the DOM
  }
};

const capitalize = (string) => {
  return string.replace(/\b\w/g, (char) => char.toUpperCase());
};

const setDatabaseStatus = async (database) => {
  const dbName = database.name;
  const status = database.status;

  const statusSpan = document.getElementById(`${dbName}-status`); // Use original name directly
  if (!statusSpan) {
    console.error(`Element with id ${dbName}-status not found`);
    return;
  }

  if (["available", "deployed"].includes(status)) {
    statusSpan.setAttribute("class", "status-badge badge text-bg-success");
    statusSpan.innerHTML = `<i class="fa-solid fa-check" style="color: #ffffff;"></i> ${capitalize(
      status
    )}`;
  } else {
    statusSpan.setAttribute("class", "status-badge badge text-bg-danger");
    statusSpan.innerHTML = `<i class="fa-solid fa-xmark" style="color: #ffffff;"></i> ${capitalize(
      status
    )}`;
  }
};

const setServiceStatus = async (service) => {
  const serviceName = service.name;
  const status = service.status;

  const statusSpan = document.getElementById(`${serviceName}-status`); // Use original name directly
  if (!statusSpan) {
    console.error(`Element with id ${serviceName}-status not found`);
    return;
  }

  if (["available", "deployed"].includes(status)) {
    statusSpan.setAttribute("class", "status-badge badge text-bg-success");
    statusSpan.innerHTML = `<i class="fa-solid fa-check" style="color: #ffffff;"></i> ${capitalize(
      status
    )}`;
  } else {
    statusSpan.setAttribute("class", "status-badge badge text-bg-danger");
    statusSpan.innerHTML = `<i class="fa-solid fa-xmark" style="color: #ffffff;"></i> ${capitalize(
      status
    )}`;
  }
};
