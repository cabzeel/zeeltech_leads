const mongoose = require('mongoose');

const WeeklyReviewSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  // Outreach metrics
  prospectsFiltered: { type: Number, default: 0 },
  dmsSent: { type: Number, default: 0 },
  responses: { type: Number, default: 0 },
  callsBooked: { type: Number, default: 0 },
  // Revenue metrics
  dealsProposed: { type: Number, default: 0 },
  dealsClosed: { type: Number, default: 0 },
  revenueXAF: { type: Number, default: 0 },
  revenueUSD: { type: Number, default: 0 },
  // Learning + build
  currentService: { type: String },
  skillAdvanced: { type: String },
  builtThisWeek: { type: String },
  shippedThisWeek: { type: String },
  // Content
  videoPosted: { type: Boolean, default: false },
  videoTopic: { type: String },
  // Review
  whatWorked: { type: String },
  whatDidnt: { type: String },
  focusNextWeek: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('WeeklyReview', WeeklyReviewSchema);