const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb://mongo:27017/toonvault';

async function resetDemo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    let user = await User.findOne({ username: 'demo_user' });
    
    if (user) {
      user.password = hashedPassword;
      await user.save();
      console.log('Demo user password reset to: demo123');
    } else {
      user = new User({
        username: 'demo_user',
        email: 'demo@toonvault.com',
        password: hashedPassword,
        role: 'reader'
      });
      await user.save();
      console.log('Demo user created with password: demo123');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetDemo();
