const mongoose = require('mongoose');

const ServiceTrackerSchema = new mongoose.Schema({
  serviceId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phase: { type: Number, required: true }, // 1-5
  tier: { type: String, enum: ['basic', 'mid', 'top', 'retainer'] },
  order: { type: Number }, // sell order
  status: {
    type: String,
    enum: ['not_started', 'learning', 'building', 'ready_to_sell', 'delivered'],
    default: 'not_started'
  },
  deliveryCount: { type: Number, default: 0 }, // how many times delivered to clients
  lastUpdated: { type: Date },
  notes: { type: String },
  checkpoints: [{
    label: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
  }],
}, { timestamps: true });

module.exports = mongoose.model('ServiceTracker', ServiceTrackerSchema);