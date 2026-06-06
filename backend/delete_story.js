const mongoose = require('mongoose');
const Story = require('./models/Story');

mongoose.connect('mongodb://mongo:27017/toonvault')
  .then(async () => {
    console.log('Connected to DB');
    const id = '69f759060daa29a60a4b5f4f';
    const result = await Story.deleteOne({ _id: id });
    console.log(`Deleted story ${id}:`, result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
