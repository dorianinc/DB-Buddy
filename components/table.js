// Function to handle table population
const populateTable = (table, database, apps) => {
  const tableBody = table.querySelector("tbody");
  tableBody.innerHTML = "";

  // Function to create a row
  const createRow = (name, status, type, version = null, lastDeployed) => {
    const row = document.createElement("tr");
    row.setAttribute("class", "table-row");

    // const syncCell = document.createElement("td");
    // if (type === "Database") {
    //   const pizza = document.createElement("i");
    //   pizza.setAttribute("class", "fa-solid fa-robot");
    //   pizza.style.color = "#ffffff";
    //   syncCell.append(pizza);
    // } else if (type === "Web Service") {
    //   const checkBox = document.createElement("input");
    //   // checkBox.setAttribute("type", "checkbox");
    //   checkBox.setAttribute("class", "sync-check-input");
    //   checkBox.setAttribute("name", name);
    //   checkBox.setAttribute("data-value", name);
    //   checkBox.addEventListener("click", (e) => {
    //     e.stopPropagation(); // Prevent the checkbox click from triggering the row click
    //   });

    //   syncCell.append(checkBox);
    // }

    const nameCell = document.createElement("td");
    nameCell.setAttribute("scope", "row");
    nameCell.textContent = name;

    const statusCell = document.createElement("td");
    statusCell.setAttribute("scope", "row");

    const statusSpan = document.createElement("span");
    statusSpan.setAttribute("class", "status-badge badge text-bg-secondary");
    statusSpan.setAttribute("id", `${name}-status`);
    statusSpan.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Deploying`;
    // if (["available", "deployed"].includes(status)) {
    //   statusSpan.setAttribute("class", "badge text-bg-success");
    //   statusSpan.innerHTML = `<i class="fa-solid fa-check" style="color: #ffffff;"></i> ${capitalize(
    //     status
    //   )}`;
    // } else {
    //   statusSpan.setAttribute("class", "badge text-bg-danger");
    //   statusSpan.innerHTML = `<i class="fa-solid fa-xmark" style="color: #ffffff;"></i> ${capitalize(
    //     status
    //   )}`;
    // }
    statusCell.appendChild(statusSpan);

    const typeCell = document.createElement("td");
    typeCell.textContent = type === "Database" ? `PostgreSQL ${version}` : type;

    const lastDeployedCell = document.createElement("td");
    lastDeployedCell.textContent = lastDeployed;

    // row.appendChild(syncCell);
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
  }

  setDatabaseStatus(database)

  // Add rows for each app service
  Object.values(apps).forEach((service) => {
    const row = createRow(
      service.name,
      service.status,
      "Web Service",
      null,
      service.lastDeployed
    );
    tableBody.appendChild(row);
  });
};

const capitalize = (string) => {
  return string.replace(/\b\w/g, (char) => char.toUpperCase());
};

const setDatabaseStatus = async (database) => {
  const dbName = database.name;
  const status = database.status;
  
  const statusSpan = document.getElementById(`${dbName}-status`)
      if (["available", "deployed"].includes(status)) {
      statusSpan.setAttribute("class", "badge text-bg-success");
      statusSpan.innerHTML = `<i class="fa-solid fa-check" style="color: #ffffff;"></i> ${capitalize(
        status
      )}`;
    } else {
      statusSpan.setAttribute("class", "badge text-bg-danger");
      statusSpan.innerHTML = `<i class="fa-solid fa-xmark" style="color: #ffffff;"></i> ${capitalize(
        status
      )}`;
    }
};
