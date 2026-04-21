const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb://mongo:27017/toonvault';

async function resetAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Try to find by email first
    let user = await User.findOne({ email: 'admin@toonvault.io' });
    
    if (!user) {
      // Try to find by username
      user = await User.findOne({ username: 'admin' });
    }
    
    if (user) {
      user.email = 'admin@toonvault.io';
      user.password = hashedPassword;
      user.role = 'admin';
      await user.save();
      console.log('Admin user updated. Email: admin@toonvault.io, Password: admin123');
    } else {
      user = new User({
        username: 'admin',
        email: 'admin@toonvault.io',
        password: hashedPassword,
        role: 'admin'
      });
      await user.save();
      console.log('Admin user created. Email: admin@toonvault.io, Password: admin123');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetAdmin();
