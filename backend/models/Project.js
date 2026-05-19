const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  businessName: { type: String },
  service: { type: String, required: true },
  tier: { type: String, enum: ['basic', 'mid', 'top'], required: true },
  market: { type: String, enum: ['cameroon', 'international'], required: true },
  currency: { type: String, enum: ['XAF', 'USD'], required: true },
  totalPrice: { type: Number, required: true },
  depositPaid: { type: Boolean, default: false },
  depositAmount: { type: Number },
  balancePaid: { type: Boolean, default: false },
  balanceAmount: { type: Number },
  status: {
    type: String,
    enum: ['proposal_sent', 'deposit_pending', 'in_progress', 'review', 'delivered', 'completed', 'cancelled'],
    default: 'proposal_sent'
  },
  startDate: { type: Date },
  deadline: { type: Date },
  deliveredDate: { type: Date },
  contactChannel: { type: String }, // instagram, whatsapp, email
  contactHandle: { type: String },
  notes: { type: String },
  addOns: [{ name: String, price: Number }],
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);