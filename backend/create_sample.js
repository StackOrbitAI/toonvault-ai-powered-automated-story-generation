const mongoose = require('mongoose');
const Story = require('./models/Story');

mongoose.connect('mongodb://mongo:27017/toonvault')
  .then(async () => {
    console.log('Connected to DB');
    
    const newStory = new Story({
      title: "The Celestial Academy",
      authorId: new mongoose.Types.ObjectId(),
      authorName: "Antigravity",
      genre: "Fantasy",
      style: "Anime",
      isPublic: true,
      views: 120,
      likes: 45,
      coverIcon: "🏰",
      characterSeed: 12345,
      episodes: [
        {
          episodeNumber: 1,
          title: "The Acceptance Letter",
          content: JSON.stringify([
            {
              text: "Luna stood before the towering gates of the Celestial Academy.",
              image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop"
            },
            {
              text: "She clutched her acceptance letter tightly.",
              image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop"
            }
          ]),
          createdAt: new Date()
        },
        {
          episodeNumber: 2,
          title: "The First Lesson",
          content: JSON.stringify([
            {
              text: "Professor Orion raised his wand, and the classroom filled with stars.",
              image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop"
            }
          ]),
          createdAt: new Date()
        }
      ]
    });
    
    await newStory.save();
    console.log(`Created sample story: ${newStory.title} with 2 episodes.`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
