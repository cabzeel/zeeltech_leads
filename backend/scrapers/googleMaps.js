const { chromium } = require('playwright');

async function scrapeGoogleMaps(category, location, limit = 50) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const query = `${category} in ${location}`;
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}?hl=en`;

  console.log(`Scraping: ${query}`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Scroll to load more results
  let previousCount = 0;

  for (let s = 0; s < 10; s++) {
    await page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]');
      if (feed) feed.scrollBy(0, 1200);
    });
    await page.waitForTimeout(2000);

    const count = await page.locator('div[role="feed"] > div').count();
    if (count === previousCount) break;
    previousCount = count;
  }

  // Extract from list directly
  const results = await page.evaluate(() => {
    const items = document.querySelectorAll('div[role="feed"] > div');
    const leads = [];

    items.forEach(item => {
      const nameEl = item.querySelector('div.fontHeadlineSmall, div.qBF1Pd');
      const ratingEl = item.querySelector('span.MW4etd');
      const reviewEl = item.querySelector('span.UY7F9');
      const addressEl = item.querySelector('div.W4Efsd:last-child > div.W4Efsd span:last-child');
      const linkEl = item.querySelector('a[href*="/maps/place/"]');

      const name = nameEl ? nameEl.innerText.trim() : '';
      if (!name || name.length < 3) return;

      leads.push({
        businessName: name,
        rating: ratingEl ? parseFloat(ratingEl.innerText) : 0,
        reviewCount: reviewEl ? parseInt(reviewEl.innerText.replace(/[^0-9]/g, '')) : 0,
        location: addressEl ? addressEl.innerText.trim() : '',
        mapLink: linkEl ? linkEl.href : '',
      });
    });

    return leads;
  });

  // Now visit each business page to get website, phone
  const leads = [];

  for (let i = 0; i < Math.min(results.length, limit); i++) {
    const result = results[i];
    if (!result.mapLink) continue;

    try {
      await page.goto(result.mapLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2500);

      const website = await page.locator('a[data-item-id="authority"]').getAttribute('href').catch(() => '');
      const phone = await page.locator('button[data-item-id*="phone"]').textContent().catch(() => '');

      leads.push({
        ...result,
        category,
        market: location,
        source: 'Google Maps',
        leadTemperature: 'cold',
        website: website || '',
        phone: phone.trim(),
        adActivity: false,
        status: 'new',
      });

      console.log(`Captured: ${result.businessName}`);

    } catch (err) {
      console.error(`Error on ${result.businessName}:`, err.message);
    }
  }

  await browser.close();
  return leads;
}

module.exports = { scrapeGoogleMaps };