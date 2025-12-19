const { chromium } = require("playwright");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://books.toscrape.com/");

  let allBooks = [];

  // Pagination loop
  while (true) {
    const books = await page.$$eval(".product_pod", items =>
      items.map(item => ({
        title: item.querySelector("h3 a").getAttribute("title").trim(),
        price: parseFloat(item.querySelector(".price_color").innerText.replace("£", "")),
      }))
    );

    allBooks.push(...books);

    const nextButton = await page.$(".next a");
    if (!nextButton) break;

    await nextButton.click();
    await page.waitForLoadState("load");
  }

  console.log("Total books scraped:", allBooks.length);

  // Save to CSV
  const csvWriter = createCsvWriter({
    path: "books.csv",
    header: [
      { id: "title", title: "Title" },
      { id: "price", title: "Price (£)" },
    ],
  });

  await csvWriter.writeRecords(allBooks);
  console.log("Data saved to books.csv");

  await browser.close();
})();
