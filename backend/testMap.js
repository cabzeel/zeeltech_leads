require('dotenv').config();
const mongoose = require('mongoose');
const { runScraper } = require('./scheduler/cron');

async function run() {
  await runScraper();
}

run();