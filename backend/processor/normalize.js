const Lead = require('../models/Lead');

async function saveLeads(leads) {
  let saved = 0;
  let skipped = 0;

  for (const lead of leads) {
    try {
      // Avoid duplicates based on business name and market
      const exists = await Lead.findOne({
        businessName: lead.businessName,
        market: lead.market,
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Lead.create(lead);
      saved++;
    } catch (err) {
      console.error(`Error saving ${lead.businessName}:`, err.message);
    }
  }

  console.log(`Saved: ${saved} | Skipped (duplicates): ${skipped}`);
}

module.exports = { saveLeads };