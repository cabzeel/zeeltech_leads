const express = require('express');
const router = express.Router();
const ServiceTracker = require('../models/ServiceTracker');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.use(requireAuth, requireSuperAdmin);

// GET all services
router.get('/', async (req, res) => {
  try {
    const services = await ServiceTracker.find().sort({ phase: 1, order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update service status
router.patch('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = { lastUpdated: new Date() };
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;
    const service = await ServiceTracker.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle checkpoint
router.patch('/:id/checkpoint/:checkpointIndex', async (req, res) => {
  try {
    const service = await ServiceTracker.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    const idx = parseInt(req.params.checkpointIndex);
    if (service.checkpoints[idx]) {
      service.checkpoints[idx].completed = !service.checkpoints[idx].completed;
      service.checkpoints[idx].completedAt = service.checkpoints[idx].completed ? new Date() : null;
    }
    service.lastUpdated = new Date();
    await service.save();
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH increment delivery count
router.patch('/:id/delivered', async (req, res) => {
  try {
    const service = await ServiceTracker.findByIdAndUpdate(
      req.params.id,
      { $inc: { deliveryCount: 1 }, status: 'delivered', lastUpdated: new Date() },
      { new: true }
    );
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST seed the 18 services (only if empty)
router.post('/seed', async (req, res) => {
  try {
    const count = await ServiceTracker.countDocuments();
    if (count > 0) return res.status(400).json({ success: false, error: 'Services already seeded' });

    const services = [
      // Phase 1
      { serviceId: 1,  name: 'Website Design & Development',     phase: 1, tier: 'mid',      order: 1,  checkpoints: [{ label: 'Build 3 hospitality demos' }, { label: 'Lighthouse 85+ on each' }, { label: 'Contact form working' }, { label: 'Deploy to Vercel' }, { label: 'Case study written' }] },
      { serviceId: 2,  name: 'Landing Page Design',              phase: 1, tier: 'basic',    order: 2,  checkpoints: [{ label: 'Study 5 high-converting pages' }, { label: 'Build 2 demo pages' }, { label: 'Facebook Pixel setup' }, { label: 'GTM event on form submit' }] },
      { serviceId: 3,  name: 'Website Redesign & Revamp',        phase: 1, tier: 'mid',      order: 5,  checkpoints: [{ label: 'Audit 3 real bad sites' }, { label: 'Learn 301 redirects' }, { label: 'Rebuild one as portfolio' }, { label: 'Before/after Lighthouse' }, { label: 'GSC setup' }] },
      { serviceId: 4,  name: 'Website Maintenance & Support',    phase: 1, tier: 'retainer', order: 6,  checkpoints: [{ label: 'UptimeRobot on 3 projects' }, { label: 'cPanel basics learned' }, { label: 'Maintenance checklist built' }, { label: 'Cloudflare configured' }, { label: 'Report template done' }] },
      { serviceId: 5,  name: 'Web Hosting & Deployment',         phase: 1, tier: 'retainer', order: 18, checkpoints: [{ label: 'Nginx setup locally' }, { label: 'SSL with Certbot' }, { label: 'Shared vs cloud hosting understood' }, { label: 'VPS deployment done' }, { label: 'Deployment playbook documented' }] },
      // Phase 2
      { serviceId: 6,  name: 'Web App Development',              phase: 2, tier: 'top',      order: 4,  checkpoints: [{ label: 'JWT auth from scratch' }, { label: 'Role-based access control' }, { label: 'Booking system API' }, { label: 'React frontend connected' }, { label: 'Full deploy with CORS' }] },
      { serviceId: 7,  name: 'API Integration',                  phase: 2, tier: 'mid',      order: 10, checkpoints: [{ label: 'Stripe end-to-end' }, { label: 'Webhooks implemented' }, { label: 'SendGrid email flow' }, { label: 'Flutterwave integrated' }, { label: 'Postman collection built' }] },
      { serviceId: 8,  name: 'E-commerce Development',           phase: 2, tier: 'top',      order: 3,  checkpoints: [{ label: 'Data model drawn' }, { label: 'Custom MERN store built' }, { label: 'WooCommerce configured' }, { label: 'Shopify basics learned' }, { label: 'Abandoned cart implemented' }] },
      { serviceId: 9,  name: 'Custom Admin Dashboard',           phase: 2, tier: 'top',      order: 15, checkpoints: [{ label: 'Data layer designed' }, { label: 'Restaurant admin built' }, { label: 'Role-based views done' }, { label: 'Sortable data tables' }, { label: 'CSV export added' }] },
      // Phase 3
      { serviceId: 10, name: 'Search Engine Optimization',       phase: 3, tier: 'retainer', order: 7,  checkpoints: [{ label: 'Technical SEO on demo site' }, { label: 'On-page SEO mastered' }, { label: 'JSON-LD schema implemented' }, { label: 'Local SEO / GBP optimized' }, { label: 'Screaming Frog crawl done' }] },
      { serviceId: 11, name: 'Website Speed & Performance',      phase: 3, tier: 'mid',      order: 12, checkpoints: [{ label: 'Core Web Vitals understood' }, { label: 'Image optimization done' }, { label: 'JS optimization applied' }, { label: 'Caching configured' }, { label: 'Before/after report built' }] },
      { serviceId: 12, name: 'UI/UX Design & Prototyping',       phase: 3, tier: 'mid',      order: 13, checkpoints: [{ label: 'Figma fundamentals done' }, { label: 'Wireframing discipline built' }, { label: 'Design system created' }, { label: 'Clickable prototype built' }, { label: 'Handoff process understood' }] },
      { serviceId: 13, name: 'Mobile Responsive Design Audit',   phase: 3, tier: 'basic',    order: 16, checkpoints: [{ label: 'Responsively App installed' }, { label: 'Audit checklist built' }, { label: 'BrowserStack tested' }, { label: 'Sample audit report written' }, { label: 'Lighthouse mobile script done' }] },
      // Phase 4
      { serviceId: 14, name: 'Google Ads & Paid Media',          phase: 4, tier: 'retainer', order: 8,  checkpoints: [{ label: 'Google Ads fundamentals learned' }, { label: 'Search campaign built' }, { label: 'Meta Ads campaign built' }, { label: 'Conversion tracking setup' }, { label: 'Looker Studio dashboard built' }] },
      { serviceId: 15, name: 'Conversion Rate Optimization',     phase: 4, tier: 'mid',      order: 14, checkpoints: [{ label: 'Hotjar installed' }, { label: 'Microsoft Clarity installed' }, { label: 'CRO framework learned' }, { label: 'A/B test run' }, { label: 'CRO audit written' }] },
      // Phase 5
      { serviceId: 16, name: 'Domain Setup & DNS Management',    phase: 5, tier: 'basic',    order: 9,  checkpoints: [{ label: 'DNS record types mastered' }, { label: 'SPF/DKIM/DMARC setup' }, { label: 'Cloudflare configured' }, { label: 'Google Workspace setup' }, { label: 'Zero-downtime migration done' }] },
      { serviceId: 17, name: 'CMS Setup & Configuration',        phase: 5, tier: 'mid',      order: 11, checkpoints: [{ label: 'WordPress custom theme built' }, { label: 'Sanity + Next.js connected' }, { label: 'Contentful SDK used' }, { label: 'Strapi self-hosted setup' }, { label: 'Client training PDF written' }] },
      { serviceId: 18, name: 'WhatsApp & Chatbot Integration',   phase: 5, tier: 'mid',      order: 17, checkpoints: [{ label: 'WhatsApp Business vs API understood' }, { label: 'Tidio/Crisp configured' }, { label: 'ManyChat flow built' }, { label: 'Twilio WhatsApp flow built' }, { label: 'Dialogflow intent bot built' }] },
    ];

    await ServiceTracker.insertMany(services);
    res.status(201).json({ success: true, message: '18 services seeded', count: services.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;