const { chromium } = require("playwright");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://quotes.toscrape.com/scroll");

  // -------------------------
  // Infinite Scroll (FIXED)
  // -------------------------
  let previousCount = 0;

  while (true) {
    const currentCount = await page.$$eval(".quote", q => q.length);

    if (currentCount === previousCount) break;

    previousCount = currentCount;

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(1500);
  }

  // -------------------------
  // Extract Data
  // -------------------------
  const quotes = await page.$$eval(".quote", items =>
    items.map(item => ({
      quote: item.querySelector(".text")?.innerText.trim(),
      author: item.querySelector(".author")?.innerText.trim(),
    }))
  );

  console.log("Total Quotes Scraped:", quotes.length);

  // -------------------------
  // Save JSON
  // -------------------------
  fs.writeFileSync("quotes.json", JSON.stringify(quotes, null, 2));

  // -------------------------
  // Save CSV
  // -------------------------
  const csvWriter = createCsvWriter({
    path: "quotes.csv",
    header: [
      { id: "quote", title: "Quote" },
      { id: "author", title: "Author" },
    ],
  });

  await csvWriter.writeRecords(quotes);

  await browser.close();
})();
