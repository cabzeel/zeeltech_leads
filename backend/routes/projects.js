const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.use(requireAuth, requireSuperAdmin);

// GET all projects
router.get('/', async (req, res) => {
  try {
    const { status, market, tier } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (market) filter.market = market;
    if (tier) filter.tier = tier;
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create project
router.post('/', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update project
router.patch('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark deposit paid
router.patch('/:id/deposit', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { depositPaid: true, status: 'in_progress', startDate: new Date() },
      { new: true }
    );
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH mark balance paid + complete
router.patch('/:id/complete', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { balancePaid: true, status: 'completed', deliveredDate: new Date() },
      { new: true }
    );
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET revenue summary
router.get('/stats/revenue', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'completed' });
    const totalXAF = projects.filter(p => p.currency === 'XAF').reduce((sum, p) => sum + p.totalPrice, 0);
    const totalUSD = projects.filter(p => p.currency === 'USD').reduce((sum, p) => sum + p.totalPrice, 0);
    const inProgress = await Project.countDocuments({ status: 'in_progress' });
    const proposalsSent = await Project.countDocuments({ status: 'proposal_sent' });
    res.json({ success: true, data: { totalXAF, totalUSD, completedDeals: projects.length, inProgress, proposalsSent } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;