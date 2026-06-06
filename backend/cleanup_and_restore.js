const mongoose = require('mongoose');
const Story = require('./models/Story');

mongoose.connect('mongodb://mongo:27017/toonvault')
  .then(async () => {
    const stories = await Story.find();
    for (const s of stories) {
      if (s.title !== "My Professor, My Heart" && s.title !== "Chronicles of the Ethereal Painter") {
        await Story.deleteOne({ _id: s._id });
        console.log(`Deleted mock story: ${s.title}`);
      } else {
        console.log(`Kept story: ${s.title}`);
      }
    }
    process.exit(0);
  });
