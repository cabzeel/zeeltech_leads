const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { generateMessage } = require('../services/messageGenerator');

// GET all leads with optional filters
router.get('/', async (req, res) => {
  try {
    const { market, category, status, temperature } = req.query;
    const filter = {};

    if (market) filter.market = new RegExp(market, 'i');
    if (category) filter.category = new RegExp(category, 'i');
    if (status) filter.status = status;
    if (temperature) filter.leadTemperature = temperature;

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST generate message for a lead
router.post('/:id/message', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    const message = await generateMessage(lead);
    if (!message) return res.status(500).json({ success: false, error: 'Message generation failed' });

    // Save generated message to lead
    lead.generatedMessage = message;
    await lead.save();

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update lead status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'reviewed', 'outreach_sent', 'replied', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update lead notes
router.patch('/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true }
    );

    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;