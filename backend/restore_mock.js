const mongoose = require('mongoose');
const Story = require('./models/Story');

const STORIES_DATA = [
  { title: "Crimson Throne", genre: "Romance Fantasy", coverIcon: "💖", views: 28800000, likes: 50000, isPublic: true },
  { title: "The Shadow Pact", genre: "Fantasy", coverIcon: "🌙", views: 9800000, likes: 12000, isPublic: true },
  { title: "My Wavering Heart", genre: "Drama", coverIcon: "🌊", views: 15100, likes: 800, isPublic: true },
  { title: "Primal Accord", genre: "Action Fantasy", coverIcon: "⚔️", views: 7700000, likes: 9000, isPublic: true },
  { title: "Duchess Reborn", genre: "Romance Fantasy", coverIcon: "👑", views: 2000000, likes: 45000, isPublic: true },
  { title: "Villain's Beloved", genre: "Dark Romance", coverIcon: "🌹", views: 10100000, likes: 80000, isPublic: true },
];

mongoose.connect('mongodb://mongo:27017/toonvault')
  .then(async () => {
    console.log('Connected to DB');
    
    // Delete all unused/existing stories
    await Story.deleteMany({});
    console.log('Deleted all old/unused stories.');
    
    // Restore the correct ones
    for (const data of STORIES_DATA) {
      const newStory = new Story({
        title: data.title,
        authorId: new mongoose.Types.ObjectId(),
        authorName: "ToonVault Official",
        genre: data.genre,
        style: "Anime",
        isPublic: true,
        views: data.views,
        likes: data.likes,
        coverIcon: data.coverIcon,
        episodes: [
          {
            episodeNumber: 1,
            title: "Prologue",
            content: JSON.stringify([
              {
                text: `Welcome to the world of ${data.title}.`,
                image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop"
              }
            ]),
            createdAt: new Date()
          }
        ]
      });
      await newStory.save();
    }
    
    console.log(`Restored ${STORIES_DATA.length} correct stories!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
