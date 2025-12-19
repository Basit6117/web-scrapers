const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100 // slow actions for weak internet
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  });

  const keyword = "machine learning";
  const location = "Pakistan";
  const maxPages = 3;

  let allJobs = [];

  for (let i = 0; i < maxPages; i++) {
    const start = i * 10;
    const url = `https://pk.indeed.com/jobs?q=${encodeURIComponent(
      keyword
    )}&l=${encodeURIComponent(location)}&start=${start}`;

    console.log(`Scraping page ${i + 1}`);
    await page.goto(url, { timeout: 0 }); // NO timeout

    // Long wait for slow internet
    await page.waitForTimeout(15000);

    const jobLinks = await page.$$(
      "a[href*='/viewjob'], a[href*='/rc/clk']"
    );

    if (jobLinks.length === 0) {
      console.log("⚠️ No jobs found on this page, skipping...");
      continue;
    }

    const jobs = await page.$$eval(
      "a[href*='/viewjob'], a[href*='/rc/clk']",
      links =>
        links.map(link => ({
          title: link.innerText.replace(/\s+/g, " ").trim(),
          url: link.href
        }))
    );

    console.log(`Found ${jobs.length} jobs`);
    allJobs.push(...jobs);
  }

  console.log("Total jobs scraped:", allJobs.length);
  await browser.close();
})();
