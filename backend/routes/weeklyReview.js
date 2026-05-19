const express = require('express');
const router = express.Router();
const WeeklyReview = require('../models/WeeklyReview');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.use(requireAuth, requireSuperAdmin);

// GET all weekly reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await WeeklyReview.find().sort({ weekStart: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single week
router.get('/:id', async (req, res) => {
  try {
    const review = await WeeklyReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new weekly review
router.post('/', async (req, res) => {
  try {
    const review = await WeeklyReview.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update weekly review
router.patch('/:id', async (req, res) => {
  try {
    const review = await WeeklyReview.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await WeeklyReview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET cumulative stats across all weeks
router.get('/stats/cumulative', async (req, res) => {
  try {
    const reviews = await WeeklyReview.find();
    const stats = reviews.reduce((acc, r) => ({
      totalProspectsFiltered: acc.totalProspectsFiltered + (r.prospectsFiltered || 0),
      totalDmsSent: acc.totalDmsSent + (r.dmsSent || 0),
      totalResponses: acc.totalResponses + (r.responses || 0),
      totalDealsClosed: acc.totalDealsClosed + (r.dealsClosed || 0),
      totalRevenueXAF: acc.totalRevenueXAF + (r.revenueXAF || 0),
      totalRevenueUSD: acc.totalRevenueUSD + (r.revenueUSD || 0),
      videosPosted: acc.videosPosted + (r.videoPosted ? 1 : 0),
      weeksLogged: acc.weeksLogged + 1,
    }), {
      totalProspectsFiltered: 0, totalDmsSent: 0, totalResponses: 0,
      totalDealsClosed: 0, totalRevenueXAF: 0, totalRevenueUSD: 0,
      videosPosted: 0, weeksLogged: 0
    });

    const responseRate = stats.totalDmsSent > 0
      ? ((stats.totalResponses / stats.totalDmsSent) * 100).toFixed(1)
      : 0;
    const closeRate = stats.totalResponses > 0
      ? ((stats.totalDealsClosed / stats.totalResponses) * 100).toFixed(1)
      : 0;

    res.json({ success: true, data: { ...stats, responseRate, closeRate } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;