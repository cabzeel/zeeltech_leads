require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const { scrapeGoogleMaps } = require('../scrapers/googleMaps');
const { saveLeads } = require('../processor/normalize');

// Rotated search queries per market
const targetRotations = {
  toronto_restaurants: [
    'restaurants in Downtown Toronto',
    'restaurants in Scarborough Toronto',
    'restaurants in Etobicoke Toronto',
    'restaurants in North York Toronto',
    'restaurants in Mississauga',
    'cafes in Toronto',
    'bistros in Toronto',
    'diners in Toronto',
    'food in Brampton Ontario',
    'eateries in Markham Ontario',
  ],
  toronto_hotels: [
    'hotels in Downtown Toronto',
    'hotels in Scarborough Toronto',
    'hotels in Etobicoke Toronto',
    'hotels in North York Toronto',
    'hotels in Mississauga',
    'motels in Toronto',
    'inns in Toronto',
    'boutique hotels in Toronto',
    'hotels in Brampton Ontario',
    'hotels in Markham Ontario',
  ],
  buea_hotels: [
    'hotels in Buea Cameroon',
    'guest houses in Buea Cameroon',
    'lodges in Buea Cameroon',
    'hotels in Limbe Cameroon',
    'hotels in Kumba Cameroon',
    'hotels in Bamenda Cameroon',
    'guest houses in Bamenda Cameroon',
    'hotels in Bafoussam Cameroon',
    'inns in Buea Cameroon',
    'apartments in Buea Cameroon',
  ],
  buea_guesthouses: [
    'guest houses in Buea Cameroon',
    'furnished apartments in Buea Cameroon',
    'guest houses in Limbe Cameroon',
    'guest houses in Kumba Cameroon',
    'guest houses in Bamenda Cameroon',
    'residences in Buea Cameroon',
    'short stay in Buea Cameroon',
    'accommodation in Limbe Cameroon',
    'accommodation in Kumba Cameroon',
    'lodging in Buea Cameroon',
  ],
};

// Track rotation index in memory
const rotationIndex = {
  toronto_restaurants: 0,
  toronto_hotels: 0,
  buea_hotels: 0,
  buea_guesthouses: 0,
};

function getNextQuery(key) {
  const queries = targetRotations[key];
  const index = rotationIndex[key] % queries.length;
  rotationIndex[key]++;
  return queries[index];
}

async function runScraper() {
  console.log('Starting nightly scrape...');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const targets = [
      { key: 'toronto_restaurants', category: 'restaurants', limit: 25 },
      { key: 'toronto_hotels', category: 'hotels', limit: 10 },
      { key: 'buea_hotels', category: 'hotels', limit: 10 },
      { key: 'buea_guesthouses', category: 'guest houses', limit: 5 },
    ];

    for (const target of targets) {
      const query = getNextQuery(target.key);
      console.log(`\nScraping: ${query}`);
      const leads = await scrapeGoogleMaps(target.category, query, target.limit);
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

module.exports = { runScraper };