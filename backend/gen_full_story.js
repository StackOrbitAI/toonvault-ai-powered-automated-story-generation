const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const Story = require('./models/Story');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/toonvault';

async function generateFullStory() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const topic = "Shadow of the Dragon's Heart";
        const prompt = "An epic fantasy romance about a banished dragon prince who falls in love with the knight sent to hunt him. Professional manhwa style.";

        // 1. Mistral for Script
        console.log("📝 Generating story script with Mistral...");
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a professional webtoon writer. Output ONLY a JSON object with: title, description, and an array 'panels' (length 6) where each item has 'text' (narration/dialogue) and 'imagePrompt' (detailed visual description for AI)."
            }, {
                role: "user",
                content: `Create a professional webtoon pilot episode about: ${topic}. Context: ${prompt}`
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { title, description, panels: storyPanels } = aiOutput;

        // 2. Image Generation with Fallback
        console.log("🎨 Generating 6 high-quality panels...");
        let imageUrls = [];
        
        // Try Runware first (if key is valid)
        if (process.env.RUNWARE_API_KEY) {
            try {
                const runwareTasks = [
                    { taskType: "authentication", apiKey: process.env.RUNWARE_API_KEY },
                    ...storyPanels.map((p) => ({
                        taskType: "imageInference",
                        taskUUID: crypto.randomUUID(),
                        model: "flux-schnell",
                        positivePrompt: `masterpiece, professional manhwa art, highly detailed, ${p.imagePrompt}`,
                        width: 512,
                        height: 768,
                        numberResults: 1
                    }))
                ];
                const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks);
                if (runwareResp.data && runwareResp.data.data) {
                    imageUrls = runwareResp.data.data
                        .filter(d => d.taskType === "imageInference" && d.imageURL)
                        .map(d => d.imageURL);
                }
            } catch (err) {
                console.warn("⚠️ Runware failed, using Pollinations fallback.");
            }
        }

        // Fallback to Pollinations
        if (imageUrls.length === 0) {
            imageUrls = storyPanels.map((p) => {
                const seed = Math.floor(Math.random() * 1000000);
                return `https://image.pollinations.ai/prompt/${encodeURIComponent("masterpiece, manhwa style, " + p.imagePrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
            });
        }

        // 3. Save to Database
        const newStory = new Story({
            title: title || topic,
            genre: "Fantasy",
            authorId: "admin",
            authorName: "ToonVault AI",
            status: 'Live',
            type: 'Comic',
            description: description,
            content: JSON.stringify(storyPanels),
            panels: imageUrls,
            coverIcon: "🐉",
            views: 1500,
            likes: 620,
            rating: 4.9,
            episodes: [{
                number: 1,
                title: "Episode 1: The Hunt Begins",
                panels: imageUrls,
                content: JSON.stringify(storyPanels.map(p => ({ text: p.text }))),
                createdAt: new Date()
            }]
        });

        await newStory.save();
        console.log("🚀 SUCCESS! Full Story Generated.");
        console.log("STORY_ID:", newStory._id);
        console.log("TITLE:", newStory.title);
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

generateFullStory();
