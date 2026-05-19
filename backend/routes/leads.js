const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { generateMessage } = require('../services/messageGenerator');
const { requireAuth } = require('../middleware/auth');

// All lead routes require auth (both employee and superadmin)
router.use(requireAuth);

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

// GET social search URLs for a lead (replaces manual search)
// Returns pre-built Instagram + Facebook search URLs for one-click lookup
router.get('/:id/social-search', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    const query = encodeURIComponent(`${lead.businessName} ${lead.city || ''}`);
    res.json({
      success: true,
      data: {
        instagram: `https://www.instagram.com/explore/search/keyword/?q=${query}`,
        facebook: `https://www.facebook.com/search/top?q=${encodeURIComponent(`${lead.businessName} ${lead.city || ''}`)}`,
        google: `https://www.google.com/search?q=${query}+instagram`,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST generate message
router.post('/:id/message', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    const message = await generateMessage(lead);
    if (!message) return res.status(500).json({ success: false, error: 'Message generation failed' });
    lead.generatedMessage = message;
    await lead.save();
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'reviewed', 'outreach_sent', 'replied', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update notes
router.patch('/:id/notes', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { notes: req.body.notes }, { new: true });
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update contact channels
router.patch('/:id/contacts', async (req, res) => {
  try {
    const { instagram, facebook, whatsapp, email } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { instagram, facebook, whatsapp, email },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE lead (both roles can delete per your decision)
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