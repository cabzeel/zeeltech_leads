require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { runScraper } = require('./scheduler/cron');
const leadsRouter = require('./routes/leads');

const app = express();
app.use(express.json());
app.use('/leads', leadsRouter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Manual scrape trigger
app.get('/scrape', async (req, res) => {
  res.json({ message: 'Scrape started' });
  await runScraper();
});

app.get('/', (req, res) => res.send('ZeelLeads API running'));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});