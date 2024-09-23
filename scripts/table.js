// Function to handle table population
const populateTable = (table, database, apps) => {
  const tableBody = table.querySelector("tbody");
  tableBody.innerHTML = ""

  // Function to create a row
  const createRow = (name, status, type, lastDeployed) => {
    const row = document.createElement("tr");
    row.setAttribute("class", "table-row");
    row.setAttribute("data-bs-toggle", "modal");
    row.setAttribute("data-bs-target", "#service-modal");
    row.setAttribute("data-name", name);

    // Pass the event along with name and apps
    row.addEventListener("click", () => {
      const appName = row.getAttribute("data-name");
      populateModal(appName, apps); // Send the name and apps to the modal
    });

    const nameCell = document.createElement("th");
    nameCell.setAttribute("scope", "row");
    nameCell.textContent = name;

    const statusCell = document.createElement("td");
    const statusSpan = document.createElement("span");
    if (["Available", "Deployed"].includes(status)) {
      statusSpan.setAttribute("class", "badge text-bg-success");
      statusSpan.textContent = status;
    } else {
      statusSpan.setAttribute("class", "badge text-bg-danger");
      statusSpan.textContent = status;
    }
    statusCell.appendChild(statusSpan);

    const typeCell = document.createElement("td");
    typeCell.textContent = type;

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
      database.type,
      database.lastDeployed
    );
    tableBody.appendChild(dbRow);
  }

  // Add rows for each app service
  Object.values(apps).forEach((service) => {
    const row = createRow(
      service.name,
      service.status,
      service.type,
      service.lastDeployed
    );
    tableBody.appendChild(row);
  });
};
