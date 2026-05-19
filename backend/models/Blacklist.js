const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  market: { type: String, required: true },
}, { timestamps: true });

BlacklistSchema.index({ businessName: 1, market: 1 }, { unique: true });

module.exports = mongoose.model('Blacklist', BlacklistSchema);