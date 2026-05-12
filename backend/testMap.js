require('dotenv').config();
const mongoose = require('mongoose');
const { scrapeGoogleMaps } = require('./scrapers/googleMaps');
const { saveLeads } = require('./processor/normalize');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const leads = await scrapeGoogleMaps('restaurants', 'Toronto', 5);
  await saveLeads(leads);

  await mongoose.disconnect();
}

run();