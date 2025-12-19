const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://books.toscrape.com/");

  // Extract multiple items
  const books = await page.$$eval(".product_pod", (items) =>
    items.map((item) => ({
      title: item.querySelector("h3 a").getAttribute("title"),
      price: item.querySelector(".price_color").innerText
    }))
  );

  console.log(books);

  await browser.close();
})();
