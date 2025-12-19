const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://pk.indeed.com/jobs?q=machine+learning&l=",
    { waitUntil: "domcontentloaded" }
  );

  // Accept cookies if shown
  try {
    await page.click('button:has-text("Accept")', { timeout: 5000 });
  } catch (e) {}

  await page.waitForSelector("div.job_seen_beacon", { timeout: 20000 });

  const jobs = await page.$$eval(
    "div.job_seen_beacon",
    cards =>
      cards.map(card => ({
        title: card.querySelector("h2 span")?.innerText.trim(),
        company: card.querySelector(".companyName")?.innerText.trim(),
        location: card.querySelector(".companyLocation")?.innerText.trim(),
        url: card.querySelector("a")?.href,
      }))
  );

  console.log("Jobs found:", jobs.length);
  console.log(jobs.slice(0, 5));

  await browser.close();
})();
