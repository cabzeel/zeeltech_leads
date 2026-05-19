require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { runScraper } = require('./scheduler/cron');
const { scrapeGoogleMaps } = require('./scrapers/googleMaps');
const { saveLeads } = require('./processor/normalize');
const { requireAuth, requireSuperAdmin } = require('./middleware/auth');
const leadsRouter = require('./routes/leads');
// const manualLeadsRouter = require('./routes/manualLeads');
const authRouter = require('./routes/auth');
const followupsRouter = require('./routes/followups');
const projectsRouter = require('./routes/projects');
const servicesRouter = require('./routes/services');
const weeklyReviewRouter = require('./routes/weeklyReview');
const Lead = require('./models/Lead');
// const ManualLead = require('./models/ManualLead');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// ── PUBLIC ROUTES ──
app.use('/auth', authRouter); // login + seed

// ── PROTECTED ROUTES (all require JWT from here) ──
app.use('/leads', leadsRouter);                                         // employee + superadmin
// app.use('/manual-leads', requireAuth, manualLeadsRouter);               // employee + superadmin
app.use('/followups', followupsRouter);                                 // employee + superadmin
app.use('/projects', projectsRouter);                                   // superadmin only
app.use('/services', servicesRouter);                                   // superadmin only
app.use('/weekly-review', weeklyReviewRouter);                          // superadmin only

// ── SCRAPER ROUTES (superadmin only) ──
app.get('/scrape', requireAuth, requireSuperAdmin, async (req, res) => {
  const { location, category } = req.query;
  if (!location || !category) {
    return res.status(400).json({ success: false, error: 'Location and category required' });
  }
  res.json({ success: true, message: 'Scrape started' });
  const leads = await scrapeGoogleMaps(category, location, 50);
  // await saveLeads(leads, ManualLead);
  console.log(`Manual scrape complete: ${location} / ${category}`);
});

app.get('/scrape/auto', requireAuth, requireSuperAdmin, async (req, res) => {
  res.json({ success: true, message: 'Auto scrape started' });
  await runScraper();
});

// ── STATS (superadmin only) ──
app.get('/stats', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const statuses = ['new', 'reviewed', 'outreach_sent', 'replied', 'converted'];
    const [autoStats, manualStats, autoTotal, manualTotal] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      // ManualLead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.countDocuments(),
      // ManualLead.countDocuments(),
    ]);
    function buildBreakdown(stats) {
      const map = {};
      stats.forEach(s => { map[s._id] = s.count; });
      return statuses.reduce((acc, s) => { acc[s] = map[s] || 0; return acc; }, {});
    }
    const autoBreakdown = buildBreakdown(autoStats);
    const manualBreakdown = buildBreakdown(manualStats);
    const totalConverted = (autoBreakdown.converted || 0) + (manualBreakdown.converted || 0);
    const totalLeads = autoTotal + manualTotal;
    res.json({
      success: true,
      data: {
        auto: { total: autoTotal, breakdown: autoBreakdown },
        manual: { total: manualTotal, breakdown: manualBreakdown },
        combined: { total: totalLeads, converted: totalConverted, conversionRate: `${totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : 0}%` },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => res.send('ZeelTech Agency API v2.0'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});