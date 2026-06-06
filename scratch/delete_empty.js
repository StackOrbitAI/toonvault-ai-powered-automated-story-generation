const mongoose = require('mongoose');
const Story = require('./backend/models/Story');

mongoose.connect('mongodb://localhost:27017/toonvault', { useNewUrlParser: true, useUnifiedTopology: true })
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
    
    // Now pick a story to generate episodes for
    const remaining = await Story.find();
    console.log(`Remaining stories: ${remaining.length}`);
    if (remaining.length > 0) {
      console.log(`Will generate episode for: ${remaining[0].title} (ID: ${remaining[0]._id})`);
    }
    
    process.exit(0);
  })
  .catch(err => console.error(err));
