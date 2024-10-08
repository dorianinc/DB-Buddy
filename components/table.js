// Function to handle table population
const populateTable = (table, database, apps) => {
  const tableBody = table.querySelector("tbody");
  tableBody.innerHTML = "";

  // Function to create a row
  const createRow = (name, type, version = null, lastDeployed) => {
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
    lastDeployedCell.textContent = lastDeployed + " ago";

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
      "Database",
      database.version,
      database.lastDeployed
    );
    tableBody.appendChild(dbRow);
    setStatus(database); // Update status after appending to the DOM
  }

  // Add rows for each app service
  for (const service of Object.values(apps)) {
    const row = createRow(
      service.name,
      "Web Service",
      null,
      service.lastDeployed
    );
    tableBody.appendChild(row); // Append to the DOM first
    setStatus(service); // Update status after appending to the DOM
  }
};

const capitalize = (string) => {
  return string.replace(/\b\w/g, (char) => char.toUpperCase());
};

const setStatus = async (item) => {
  console.log("🖥️  item: ", item)
  const name = item.name;
  const status = item.status;

  const statusSpan = document.getElementById(`${name}-status`); // Use original name directly
  if (!statusSpan) {
    console.error(`Element with id ${name}-status not found`);
    return;
  }

  switch (status) {
    case "available":
    case "deployed":
      statusSpan.setAttribute("class", "status-badge badge text-bg-success");
      statusSpan.innerHTML = `<i class="fa-solid fa-check" style="color: #ffffff;"></i> ${capitalize(
        status
      )}`;
      break;
    case "deploying":
      statusSpan.setAttribute("class", "status-badge badge text-bg-secondary");
      statusSpan.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> ${capitalize(
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
