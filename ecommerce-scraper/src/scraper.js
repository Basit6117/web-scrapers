const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  let allProducts = [];
  let pageNumber = 1;

  // Go to first page
  await page.goto("https://books.toscrape.com/catalogue/page-1.html", { timeout: 0 });

  while (true) {
    console.log(`Scraping page ${pageNumber}...`);

    // Wait for products to load
    await page.waitForTimeout(2000);

    // Extract products on current page
    const products = await page.$$eval(".product_pod", cards =>
      cards.map(card => ({
        title: card.querySelector("h3 a")?.title || "",
        price: card.querySelector(".price_color")?.innerText || "",
        rating: card.querySelector(".star-rating")?.classList[1] || "",
        url: card.querySelector("h3 a")?.href || ""
      }))
    );

    allProducts.push(...products);
    console.log(`Found ${products.length} products`);

    // Check for next page
    const nextButton = await page.$(".next a");
    if (!nextButton) {
      console.log("No more pages.");
      break;
    }

    // Click next and wait
    await nextButton.click();
    pageNumber++;
    await page.waitForTimeout(2000);
  }

  console.log(`Total products scraped: ${allProducts.length}`);

  // Save CSV
  const csvHeader = "Title,Price,Rating,URL\n";
  const csvRows = allProducts
    .map(p => `"${p.title}","${p.price}","${p.rating}","${p.url}"`)
    .join("\n");

  if (!fs.existsSync("output")) fs.mkdirSync("output");
  fs.writeFileSync("output/products.csv", csvHeader + csvRows);

  console.log("CSV file saved as output/products.csv");

  await browser.close();
})();
