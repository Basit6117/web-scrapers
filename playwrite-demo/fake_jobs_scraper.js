const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  let allJobs = [];
  let pageNumber = 1;

  await page.goto("https://realpython.github.io/fake-jobs/", {
    timeout: 0
  });

  while (true) {
    console.log(`Scraping page ${pageNumber}`);

    await page.waitForTimeout(2000);

    const jobs = await page.$$eval(".card-content", cards =>
      cards.map(card => ({
        title: card.querySelector("h2")?.innerText || "",
        company: card.querySelector(".company")?.innerText || "",
        location: card.querySelector(".location")?.innerText || "",
        link: card.querySelector("a")?.href || ""
      }))
    );

    allJobs.push(...jobs);
    console.log(`Found ${jobs.length} jobs`);

    const nextButton = await page.$("a[aria-label='Next']");

    if (!nextButton) {
      console.log("No more pages.");
      break;
    }

    await nextButton.click();
    pageNumber++;
  }

  console.log(`Total jobs scraped: ${allJobs.length}`);

  // Save to CSV
  const csvHeader = "Title,Company,Location,Link\n";
  const csvRows = allJobs
    .map(job =>
      `"${job.title}","${job.company}","${job.location}","${job.link}"`
    )
    .join("\n");

  fs.writeFileSync("jobs.csv", csvHeader + csvRows);

  console.log("CSV file saved as jobs.csv");

  await browser.close();
})();
