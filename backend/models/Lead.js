const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    businessName: String,
    category: String,
    market: String,
    source: String,
    leadTemperature: { type: String, enum: ["cold", "warm"], default: "cold" },
    website: String,
    instagram: String,
    facebook: String,
    linkedin: String,
    email: String,
    location: String,
    rating: Number,
    reviewCount: Number,
    adActivity: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["new", "reviewed", "outreach_sent", "replied", "converted"],
      default: "new",
    },
    notes: String,
    instagram: String,
    facebook: String,
    whatsapp: String,
    email: String,
    generatedMessage: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lead", LeadSchema);
