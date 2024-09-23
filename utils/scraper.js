const { chromium } = require("playwright");
const { writeToFile } = require("./helpers");

const getPage = async () => {
  // Launch browser and open a new page
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the website
  await page.goto("https://dashboard.render.com/");
  return page;
};

const login = async (page) => {
  // Click the "Github" button
  await page.getByRole("button", { name: "Github" }).click();

  // Log in (if necessary)
  await page.getByLabel("Username or email address").fill("dorianinc");
  await page.waitForTimeout(1000);
  await page.getByLabel("Password").fill("Drm#0540095");
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForTimeout(1000);

  const authButton = page.getByRole("button", {
    name: "Authorize Render",
  });

  const isVisible = await authButton.isVisible();
  if (isVisible) {
    await authButton.click();
  }
};

const fetchRenderServices = async () => {
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
    console.error("Error in fetchRenderServices:", error);
    throw error; // Re-throw the error after logging
  }
};

module.exports = {
  fetchRenderServices,
};
