const mongoose = require('mongoose');
const Story = require('./models/Story');
const User = require('./models/User');

const MONGO_URI = 'mongodb://mongo:27017/toonvault';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!admin) {
            console.error("No user found. Please create a user first.");
            process.exit(1);
        }

        const branchingStory = new Story({
            title: "The Labyrinth of Fate",
            genre: "Fantasy",
            authorId: admin._id,
            authorName: admin.username,
            status: 'Live',
            type: 'Comic',
            description: "A legendary adventure where your choices shape the world. Traverse the labyrinth and uncover the truth.",
            coverIcon: "🌀",
            views: 12500,
            likes: 850,
            rating: 4.9,
            nodes: [
                {
                    id: 's1',
                    label: 'Scene 1',
                    title: 'The Entrance',
                    description: 'You stand before the massive stone gates of the labyrinth.',
                    type: 'scene',
                    status: 'unlocked',
                    x: 0,
                    y: 0
                },
                {
                    id: 's2',
                    label: 'Scene 2',
                    title: 'The Whispering Hall',
                    description: 'Strange voices echo through the corridor.',
                    type: 'scene',
                    status: 'unlocked',
                    x: 200,
                    y: 0
                },
                {
                    id: 's3',
                    label: 'Scene 3',
                    title: 'The Crossroads',
                    description: 'The path splits into three. Which way will you go?',
                    type: 'scene',
                    status: 'unlocked',
                    isPopular: true,
                    x: 400,
                    y: 0
                },
                {
                    id: 's4',
                    label: 'Path A',
                    title: 'The Sunken Crypt',
                    description: 'A dark, damp path leading down into the earth.',
                    type: 'scene',
                    status: 'locked',
                    isAgeRestricted: true,
                    x: 600,
                    y: -100
                },
                {
                    id: 's5',
                    label: 'Path B',
                    title: 'The Sky Bridge',
                    description: 'A narrow bridge suspended high above the clouds.',
                    type: 'scene',
                    status: 'unlocked',
                    creatorPick: true,
                    authorId: admin._id.toString(),
                    authorName: admin.username,
                    x: 600,
                    y: 0
                },
                {
                    id: 's6',
                    label: 'Path C',
                    title: 'The Hidden Garden',
                    description: 'A serene garden hidden behind an illusion.',
                    type: 'scene',
                    status: 'locked',
                    authorId: 'another_user_id',
                    authorName: 'MysteryWriter',
                    x: 600,
                    y: 100
                }
            ]
        });

        await branchingStory.save();
        console.log("✅ Branching Story Seeded: The Labyrinth of Fate");
        console.log("Story ID:", branchingStory._id);

        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();
