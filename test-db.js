const mongoose = require('mongoose');
const Story = require('./backend/models/Story');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/toonvault');
  const story = await Story.findById('6a0ae2cfe3f96d12a4b9772c');
  console.log("Story:", story);
  process.exit(0);
}
test().catch(console.error);
