const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Setting = require('./models/Setting');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/toonvault';

async function verifyAndSeed() {
  try {
    console.log('🔗 Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    // 1. Check/Create Admin User
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('⚠️ No admin user found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new User({
        username: 'admin',
        email: 'admin@toonvault.com',
        password: hashedPassword,
        role: 'admin',
        plan: 'Gold'
      });
      await admin.save();
      console.log('✅ Admin user created: admin@toonvault.com / admin123');
    } else {
      console.log('✅ Admin user exists:', admin.email);
    }

    // 2. Seed Settings
    const defaults = [
        { key: 'show_creator_popup', value: 'true', label: 'Show Creator Popup', type: 'boolean' },
        { key: 'site_name', value: 'ToonVault', label: 'Site Name', type: 'text' },
        { key: 'maintenance_mode', value: 'false', label: 'Maintenance Mode', type: 'boolean' },
        { key: 'free_episode_interval_hrs', value: '3', label: 'Free Episode Interval (Hrs)', type: 'number' },
        { key: 'payment_paypal_enabled', value: 'true', label: 'Enable PayPal', type: 'boolean' },
        { key: 'social_google_enabled', value: 'true', label: 'Google Login Enabled', type: 'boolean' },
        { key: 'social_facebook_enabled', value: 'false', label: 'Facebook Login Enabled', type: 'boolean' },
        { key: 'email_verification_enabled', value: 'false', label: 'Email Verification Required', type: 'boolean' }
    ];

    for (const d of defaults) {
      const exists = await Setting.findOne({ key: d.key });
      if (!exists) {
        await Setting.create(d);
        console.log(`✅ Seeded setting: ${d.key}`);
      }
    }

    console.log('🚀 Verification and seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during verification:', err);
    process.exit(1);
  }
}

verifyAndSeed();
