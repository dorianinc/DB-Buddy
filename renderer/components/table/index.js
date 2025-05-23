const setTable = (database, apps) => {
  const databaseExists = isEmpty(database);
  const buildText = databaseExists ? "Rebuild Database" : "Build Database";
  const { statusContainer, tableContainer } = getContainers();

  tableContainer.innerHTML = "";
  tableContainer.style.display = "flex";
  statusContainer.style.display = "none";

  const buildButton = document.createElement("button");
  buildButton.innerText = buildText;
  buildButton.style.display = "inline";
  buildButton.setAttribute("class", "btn btn-primary btn-lg");
  buildButton.setAttribute("data-bs-toggle", "modal");
  buildButton.setAttribute("data-bs-target", "#main-modal");
  buildButton.addEventListener("click", () => {
    openModal("Warning", databaseExists);
  });

  const table = document.createElement("table");
  table.setAttribute("class", "table table-dark");
  table.setAttribute("id", "services-table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = ["Service Name", "Status", "Type"];
  headers.forEach((text) => {
    const th = document.createElement("th");
    th.setAttribute("scope", "col");
    th.textContent = text;
    headerRow.append(th);
  });

  thead.append(headerRow);
  table.append(thead);

  const tableBody = document.createElement("tbody");
  tableBody.setAttribute("id", "table-body");
  table.append(tableBody);

  tableContainer.append(table);
  tableContainer.append(buildButton);

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
    statusSpan.style.display = "flex";
    statusSpan.style.alignItems = "center";
    statusSpan.style.justifyContent = "center";
    statusSpan.style.width = "fit-content";
    statusSpan.style.gap = "5px";
    statusSpan.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Retrieving`;
    statusCell.append(statusSpan);

    const typeCell = document.createElement("td");
    typeCell.textContent = type === "Database" ? `PostgreSQL ${version}` : type;

    row.append(nameCell);
    row.append(statusCell);
    row.append(typeCell);

    return row;
  };

  if (database) {
    const dbRow = createRow(database.name, "Database", database.version);
    tableBody.append(dbRow);
    setStatus(database);
  }

  for (const service of Object.values(apps)) {
    const row = createRow(service.name, "Web Service", null);
    tableBody.append(row);
    setStatus(service);
  }
};

const setStatus = async (item) => {
  const name = item.name;
  const status = item.status;
  const statusSpan = document.getElementById(`${name}-status`);
  if (!statusSpan) return;
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
