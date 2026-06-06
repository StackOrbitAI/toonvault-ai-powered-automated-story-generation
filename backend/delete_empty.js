const mongoose = require('mongoose');
const Story = require('./models/Story');

mongoose.connect('mongodb://mongo:27017/toonvault')
  .then(async () => {
    console.log('Connected to DB');
    const stories = await Story.find();
    let deleted = 0;
    for (const story of stories) {
      if (!story.episodes || story.episodes.length === 0) {
        console.log(`Deleting story: ${story.title} (No episodes)`);
        await Story.deleteOne({ _id: story._id });
        deleted++;
      }
    }
    console.log(`Deleted ${deleted} empty stories.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
