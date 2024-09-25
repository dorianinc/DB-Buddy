
const { writeToFile } = require("../utils/helpers");
const {getPage, login} = require("./helpers")

const fetchRenderData = async () => {
  try {
    const page = await getPage();
    await login(page);

    // Collect data from the table
    const rows = page.locator("tr");
    await page.waitForTimeout(5500);

    const services = {};
    let database;
    const baseURL = "https://dashboard.render.com";
    await page.evaluate(() => window.scrollBy(0, 450));

    // Loop through each row and gather service info
    for (let i = 1; i < (await rows.count()); i++) {
      try {
        const obj = {};
        const row = rows.nth(i);
        const columns = row.locator("td");

        const serviceInfo = row.locator("a").nth(0);
        const href = await serviceInfo.getAttribute("href");
        const name = await serviceInfo.innerText();

        // Ensure we have the right data in columns
        if ((await columns.count()) < 5) {
          console.error(`Insufficient columns in row ${i}`);
          continue; // Skip this row
        }

        obj.name = name;
        obj.url = baseURL + href;
        obj.type = await columns.nth(1).innerText();
        obj.lastDeployed = await columns.nth(4).innerText();

        if (href.startsWith("/d")) {
          obj.status = await columns.nth(0).innerText();
        } else {
          obj.status = await columns.nth(0).locator(".inline-flex").innerText();
        }

        if (!href.startsWith("/d")) {
          services[name] = obj;
        } else {
          database = obj;
        }
      } catch (rowError) {
        console.error(`Error processing row ${i}:`, rowError);
      }
    }

    const response = { database, apps: services };
    await writeToFile("services.txt", response, "json");
    return response;
  } catch (error) {
    console.error("Error in fetchRenderData:", error);
    throw error; // Re-throw the error after logging
  }
};

module.exports = {
  fetchRenderData,
};
