const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://books.toscrape.com/");

  let allBooks = [];

  while (true) {
    // Scrape current page
    const books = await page.$$eval(".product_pod", (items) =>
      items.map((item) => ({
        title: item.querySelector("h3 a").getAttribute("title"),
        price: item.querySelector(".price_color").innerText
      }))
    );

    allBooks.push(...books);

    // Check if next page exists
    const nextButton = await page.$(".next a");
    if (!nextButton) break;

    // Click next page
    await nextButton.click();
    await page.waitForLoadState("load");
  }

  console.log(allBooks);
  console.log("Total books scraped:", allBooks.length);

  await browser.close();
})();
