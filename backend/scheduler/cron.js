require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const { scrapeGoogleMaps } = require('../scrapers/googleMaps');
const { saveLeads } = require('../processor/normalize');

const targets = [
  { category: 'restaurants', location: 'Toronto', limit: 25 },
  { category: 'hotels', location: 'Toronto', limit: 10 },
  { category: 'hotels', location: 'Buea Cameroon', limit: 10 },
  { category: 'guest houses', location: 'Buea Cameroon', limit: 5 },
];

async function runScraper() {
  console.log('Starting nightly scrape...');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    for (const target of targets) {
      console.log(`\nScraping: ${target.category} in ${target.location}`);
      const leads = await scrapeGoogleMaps(target.category, target.location, target.limit);
      await saveLeads(leads);
    }

    console.log('\nNightly scrape complete.');
  } catch (err) {
    console.error('Scraper error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Run every night at 11:00 PM
cron.schedule('0 23 * * *', () => {
  console.log('Cron triggered at 11:00 PM');
  runScraper();
});

// Also export so we can trigger manually
module.exports = { runScraper };