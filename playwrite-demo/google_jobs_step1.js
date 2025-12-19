const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://www.google.com/search?q=machine+learning+jobs&ibp=htl;jobs",
    { waitUntil: "domcontentloaded" }
  );

  const JOB_PANEL_SELECTOR = '[role="feed"]';
  await page.waitForSelector(JOB_PANEL_SELECTOR, { timeout: 15000 });

  let previousCount = 0;

  while (true) {
    const currentCount = await page.$$eval(
      '[data-job-id]',
      jobs => jobs.length
    );

    if (currentCount === previousCount) break;

    previousCount = currentCount;

    await page.evaluate(() => {
      const panel = document.querySelector('[role="feed"]');
      panel.scrollBy(0, panel.scrollHeight);
    });

    await page.waitForTimeout(2000);
  }

  const jobs = await page.$$eval('[data-job-id]', cards =>
    cards.map(card => ({
      title: card.querySelector("h3")?.innerText.trim(),
      company: card.querySelector(".vNEEBe")?.innerText.trim(),
      location: card.querySelector(".Qk80Jf")?.innerText.trim(),
    }))
  );

  console.log("Total jobs scraped:", jobs.length);
  console.log(jobs.slice(0, 5));

  await browser.close();
})();
