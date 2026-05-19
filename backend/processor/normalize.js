const Lead = require('../models/Lead');
const Blacklist = require('../models/Blacklist');

async function saveLeads(leads) {
  let saved = 0;
  let skipped = 0;

  for (const lead of leads) {
    try {
      // Check blacklist first
      const blacklisted = await Blacklist.findOne({
        businessName: lead.businessName,
        market: lead.market,
      });

      if (blacklisted) {
        skipped++;
        continue;
      }

      // Check current leads collection
      const exists = await Lead.findOne({
        businessName: lead.businessName,
        market: lead.market,
      });

      if (exists) {
        skipped++;
        continue;
      }

      // Save to leads
      await Lead.create(lead);

      // Add to blacklist so it never comes back
      await Blacklist.create({
        businessName: lead.businessName,
        market: lead.market,
      });

      saved++;
    } catch (err) {
      console.error(`Error saving ${lead.businessName}:`, err.message);
    }
  }

  console.log(`Saved: ${saved} | Skipped (duplicates): ${skipped}`);
}

module.exports = { saveLeads };