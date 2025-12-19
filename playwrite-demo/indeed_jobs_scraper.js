const { chromium } = require("playwright");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Fix: set user-agent in context
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  });
  const page = await context.newPage();

  const query = "machine+learning";
  const location = "";
  const startUrl = `https://www.indeed.com/jobs?q=${query}&l=${location}`;
  await page.goto(startUrl, { waitUntil: "domcontentloaded" });

  let allJobs = [];
  const MAX_PAGES = 5;

  for (let i = 0; i < MAX_PAGES; i++) {
    await page.waitForTimeout(1000);

    const jobs = await page.$$eval('a.tapItem, div.job_seen_beacon', cards =>
      cards.map(card => {
        const titleEl = card.querySelector('h2.jobTitle, h2 > span') || {};
        const companyEl = card.querySelector('.companyName') || {};
        const locationEl = card.querySelector('.companyLocation') || {};
        const dateEl = card.querySelector('.date, .date-posted') || {};
        const anchor = card.querySelector('a');

        return {
          title: titleEl.innerText?.trim() || null,
          company: companyEl.innerText?.trim() || null,
          location: locationEl.innerText?.trim() || null,
          date_posted: dateEl.innerText?.trim() || null,
          link: anchor?.href || null
        };
      })
    );

    allJobs.push(...jobs);

    const nextBtn = await page.$('a[aria-label="Next"]');
    if (!nextBtn) break;

    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }).catch(() => {}),
      nextBtn.click().catch(() => {})
    ]);
  }

  console.log("Total jobs scraped:", allJobs.length);

  const csvWriter = createCsvWriter({
    path: "indeed_ml_jobs.csv",
    header: [
      { id: "title", title: "Title" },
      { id: "company", title: "Company" },
      { id: "location", title: "Location" },
      { id: "date_posted", title: "Date Posted" },
      { id: "link", title: "Job URL" },
    ],
  });

  await csvWriter.writeRecords(allJobs);
  console.log("Data saved to indeed_ml_jobs.csv");

  await browser.close();
})();
