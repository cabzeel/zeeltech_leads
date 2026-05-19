// Run this ONCE to create your superadmin account
// node seed.js
// Then delete or keep it — it won't run again if a user already exists via the /auth/seed route

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const count = await User.countDocuments();
  if (count > 0) {
    console.log('Users already exist. Skipping seed.');
    process.exit(0);
  }

  const superadmin = await User.create({
    name: 'Cabzeel',
    email: 'zilodev831@gmail.com',
    password: 'ZeelTech2026!', // Change this after first login
    role: 'superadmin',
  });

  console.log('Superadmin created:');
  console.log(`  Name: ${superadmin.name}`);
  console.log(`  Email: ${superadmin.email}`);
  console.log(`  Role: ${superadmin.role}`);
  console.log('\nChange your password after first login!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});