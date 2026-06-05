const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const Story = require('./models/Story');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/toonvault';

async function generateMultiEpisodeStory() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const topic = "The Healer's Rebellion";
        const prompt = "A story about a secret healer in a world where magic is banned. She must save the very prince who hunts her kind. Professional manhwa style.";

        console.log("📝 Generating Episode 1 Script...");
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: `You are a professional webtoon writer. 
                Output ONLY a JSON object with: 
                title, 
                description, 
                episodes: [
                    {
                        number: 1,
                        title: "Episode 1 Title",
                        description: "Episode 1 summary",
                        scenes: [
                            {
                                number: 1,
                                title: "Scene 1 Title",
                                panels: [ { text: "...", imagePrompt: "..." } ], // 3 panels per scene
                                choicePrompts: [ { label: "A", title: "...", desc: "...", targetScene: 2 } ]
                            },
                            {
                                number: 2,
                                title: "Scene 2 Title",
                                panels: [ { text: "...", imagePrompt: "..." } ],
                                choicePrompts: []
                            }
                        ]
                    }
                ]`
            }, {
                role: "user",
                content: `Create 2 episodes with 2 scenes each for: ${topic}. ${prompt}`
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { title, description, episodes } = aiOutput;

        console.log("🎨 Generating images for all episodes and scenes...");
        
        for (let ep of episodes) {
            console.log(`  - Processing Episode ${ep.number}: ${ep.title}`);
            for (let scene of ep.scenes) {
                console.log(`    - Generating 3 panels for Scene ${scene.number}: ${scene.title}`);
                scene.imageUrls = scene.panels.map((p) => {
                    const seed = Math.floor(Math.random() * 1000000);
                    return `https://image.pollinations.ai/prompt/${encodeURIComponent("masterpiece, manhwa style, " + p.imagePrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
                });
            }
        }

        // Map to DB Schema
        const dbEpisodes = episodes.map(ep => ({
            number: ep.number,
            title: ep.title,
            description: ep.description,
            scenes: ep.scenes.map(s => ({
                number: s.number,
                title: s.title,
                panels: s.imageUrls,
                content: JSON.stringify(s.panels),
                choicePrompts: s.choicePrompts
            }))
        }));

        const newStory = new Story({
            title: title || topic,
            genre: "Fantasy",
            authorId: "admin",
            authorName: "ToonVault AI",
            status: 'Live',
            type: 'Comic',
            description: description,
            coverIcon: "✨",
            views: 2500,
            likes: 1200,
            rating: 5.0,
            episodes: dbEpisodes
        });

        await newStory.save();
        console.log("🚀 SUCCESS! Multi-Episode Story Generated.");
        console.log("STORY_ID:", newStory._id);
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

generateMultiEpisodeStory();
