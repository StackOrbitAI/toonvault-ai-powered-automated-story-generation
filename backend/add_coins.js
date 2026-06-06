const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://mongo:27017/toonvault')
  .then(async () => {
    await User.updateOne({ email: 'demo@toonvault.com' }, { $inc: { coins: 1000 } });
    console.log('Added 1000 coins.');
    process.exit(0);
  });
