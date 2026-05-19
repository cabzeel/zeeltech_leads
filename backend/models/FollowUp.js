const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  leadName: { type: String },
  platform: { type: String, enum: ['instagram', 'facebook', 'whatsapp', 'email'] },
  handle: { type: String },
  // DM sequence
  dm1SentAt: { type: Date }, // pitch
  dm2SentAt: { type: Date }, // soft check-in (Day 4)
  dm3SentAt: { type: Date }, // closer (Day 11)
  // Status
  currentStage: {
    type: String,
    enum: ['dm1_sent', 'dm2_pending', 'dm2_sent', 'dm3_pending', 'dm3_sent', 'responded', 'cold'],
    default: 'dm1_sent'
  },
  movedToColdAt: { type: Date },
  respondedAt: { type: Date },
  convertedAt: { type: Date },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', FollowUpSchema);