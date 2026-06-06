const mongoose = require('mongoose');
const Story = require('./models/Story');

mongoose.connect('mongodb://mongo:27017/toonvault')
  .then(async () => {
    const story = await Story.findOne({ title: 'Chronicles of the Ethereal Painter' });
    if (story && story.nodes && story.nodes.length > 0) {
      const episodes = story.nodes.map((n, i) => ({
        number: i + 1,
        title: n.title || `Episode ${i + 1}`,
        description: n.description,
        panels: n.panels,
        content: JSON.stringify([{ speaker: "Narration", text: n.description, imageUrl: n.panels[0] }]),
        createdAt: new Date()
      }));
      story.episodes = episodes;
      await story.save();
      console.log('Fixed episodes for ' + story.title);
    }
    process.exit(0);
  });
