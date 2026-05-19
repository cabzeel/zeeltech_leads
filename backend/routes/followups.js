const express = require('express');
const router = express.Router();
const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET all follow-ups with optional stage filter
router.get('/', async (req, res) => {
  try {
    const { stage } = req.query;
    const filter = {};
    if (stage) filter.currentStage = stage;
    const followUps = await FollowUp.find(filter).sort({ createdAt: -1 });

    // Flag overdue ones
    const now = new Date();
    const enriched = followUps.map(f => {
      const obj = f.toObject();
      obj.isDue = false;
      obj.dueLabel = null;

      if (f.currentStage === 'dm1_sent' && f.dm1SentAt) {
        const daysSince = Math.floor((now - f.dm1SentAt) / (1000 * 60 * 60 * 24));
        if (daysSince >= 3) { obj.isDue = true; obj.dueLabel = 'DM 2 due'; }
      }
      if (f.currentStage === 'dm2_sent' && f.dm2SentAt) {
        const daysSince = Math.floor((now - f.dm2SentAt) / (1000 * 60 * 60 * 24));
        if (daysSince >= 7) { obj.isDue = true; obj.dueLabel = 'DM 3 due'; }
      }
      return obj;
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create follow-up when DM 1 is sent
router.post('/', async (req, res) => {
  try {
    const { leadId, platform, handle } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    const existing = await FollowUp.findOne({ leadId });
    if (existing) return res.status(400).json({ success: false, error: 'Follow-up already exists for this lead' });

    const followUp = await FollowUp.create({
      leadId,
      leadName: lead.businessName,
      platform,
      handle,
      dm1SentAt: new Date(),
      currentStage: 'dm1_sent',
    });

    // Update lead status
    await Lead.findByIdAndUpdate(leadId, { status: 'outreach_sent' });

    res.status(201).json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark DM 2 sent
router.patch('/:id/dm2', async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { dm2SentAt: new Date(), currentStage: 'dm2_sent' },
      { new: true }
    );
    if (!followUp) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark DM 3 sent
router.patch('/:id/dm3', async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { dm3SentAt: new Date(), currentStage: 'dm3_sent' },
      { new: true }
    );
    if (!followUp) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark as responded
router.patch('/:id/responded', async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { respondedAt: new Date(), currentStage: 'responded' },
      { new: true }
    );
    await Lead.findByIdAndUpdate(followUp.leadId, { status: 'replied' });
    res.json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH move to cold
router.patch('/:id/cold', async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { movedToColdAt: new Date(), currentStage: 'cold' },
      { new: true }
    );
    res.json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH notes
router.patch('/:id/notes', async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes },
      { new: true }
    );
    res.json({ success: true, data: followUp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;