const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const Story = require('../models/Story');
const User = require('../models/User');
const CONFIG = require('../story_engine.config.json');

const MISTRAL_KEY = process.env.MISTRAL_API_KEY || CONFIG.engine.apiKey; // Using same if not set
const RUNWARE_KEY = process.env.RUNWARE_API_KEY || CONFIG.engine.apiKey;

async function generateImage(prompt) {
    const runwareTasks = [{
        taskType: "authentication", apiKey: RUNWARE_KEY
    }, {
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        model: CONFIG.engine.model,
        positivePrompt: `${CONFIG.storyDefaults.basePositivePrompt}, ${prompt}`,
        negativePrompt: CONFIG.imageSettings.negativePrompt,
        width: CONFIG.imageSettings.width,
        height: CONFIG.imageSettings.height,
        numberResults: 1,
        outputFormat: CONFIG.imageSettings.outputFormat,
        CFGScale: CONFIG.imageSettings.CFGScale,
        steps: CONFIG.imageSettings.steps
    }];

    const resp = await axios.post(CONFIG.engine.apiEndpoint, runwareTasks, { timeout: 120000 });
    const imgData = resp.data.data.find(d => d.taskType === "imageInference");
    return imgData ? imgData.imageURL : '';
}

async function generateNewStory() {
    console.log("📝 Generating new daily story...");
    const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
    
    // 1. Mistral for concept and first episode
    const prompt = `You are a world-class manhwa writer. Generate a completely new story concept.
    Output JSON:
    - title: String
    - genre: String (e.g., Romance, Action, Thriller)
    - description: String
    - isAdult: Boolean (true if mature)
    - episode: Object containing:
        - title: "Episode 1"
        - panels: Array of 3 objects { prompt: "detailed image prompt", text: "narration/dialogue", speaker: "Narration or Character Name" }
    `;

    try {
        const resp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });

        const data = JSON.parse(resp.data.choices[0].message.content);
        const targetEpisodes = Math.floor(Math.random() * 11) + 10; // 10 to 20

        // 2. Generate images
        const imageUrls = [];
        for (const panel of data.episode.panels) {
            const url = await generateImage(panel.prompt);
            imageUrls.push(url);
        }

        const contentArr = data.episode.panels.map((p, i) => ({
            speaker: p.speaker,
            text: p.text,
            imageUrl: imageUrls[i] || ''
        }));

        const newStory = new Story({
            title: data.title,
            genre: data.genre,
            isAdult: data.isAdult || false,
            authorId: admin ? admin._id : "admin",
            authorName: admin ? admin.username : "ToonVault Engine",
            description: data.description,
            targetEpisodes: targetEpisodes,
            isCompleted: false,
            coverBg: "#1a0f2e",
            coverIcon: "✨",
            views: Math.floor(Math.random() * 5000),
            likes: Math.floor(Math.random() * 500),
            rating: 4.5 + Math.random() * 0.5,
            status: 'Live',
            type: 'Comic',
            panels: [imageUrls[0]],
            episodes: [{
                number: 1,
                title: data.episode.title || "Episode 1",
                panels: imageUrls,
                content: JSON.stringify(contentArr),
                createdAt: new Date()
            }]
        });

        await newStory.save();
        console.log(`✅ Created Daily Story: ${newStory.title} (Target: ${targetEpisodes} eps)`);
    } catch (e) {
        console.error("Error generating new story:", e.response?.data || e.message);
    }
}

async function addEpisodeToExisting(story) {
    console.log(`📝 Adding episode ${story.episodes.length + 1} to "${story.title}"...`);
    const prompt = `You are writing episode ${story.episodes.length + 1} for the story titled "${story.title}".
    Genre: ${story.genre}.
    Output JSON:
    - title: "Episode ${story.episodes.length + 1}"
    - panels: Array of 3 objects { prompt: "detailed image prompt", text: "narration/dialogue", speaker: "Narration or Character Name" }
    `;

    try {
        const resp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });

        const data = JSON.parse(resp.data.choices[0].message.content);

        const imageUrls = [];
        for (const panel of data.panels) {
            const url = await generateImage(panel.prompt);
            imageUrls.push(url);
        }

        const contentArr = data.panels.map((p, i) => ({
            speaker: p.speaker,
            text: p.text,
            imageUrl: imageUrls[i] || ''
        }));

        story.episodes.push({
            number: story.episodes.length + 1,
            title: data.title || `Episode ${story.episodes.length + 1}`,
            panels: imageUrls,
            content: JSON.stringify(contentArr),
            createdAt: new Date()
        });

        if (story.episodes.length >= story.targetEpisodes) {
            story.isCompleted = true;
            console.log(`🏆 Story "${story.title}" has reached its target of ${story.targetEpisodes} episodes and is now COMPLETED.`);
        }

        await story.save();
        console.log(`✅ Added episode to ${story.title}`);
    } catch (e) {
        console.error(`Error adding episode to ${story.title}:`, e.response?.data || e.message);
    }
}

async function runDailyTasks() {
    console.log("🚀 Starting daily automated generation task...");

    // 1. Generate 1 brand new story
    await generateNewStory();

    // 2. Add 1 episode to existing active stories
    const activeStories = await Story.find({ isCompleted: { $ne: true } });
    console.log(`Found ${activeStories.length} active stories to update.`);

    for (const story of activeStories) {
        // Double check condition
        if (!story.targetEpisodes) {
            story.targetEpisodes = Math.floor(Math.random() * 11) + 10;
        }
        if (story.episodes && story.episodes.length < story.targetEpisodes) {
            await addEpisodeToExisting(story);
        } else {
            story.isCompleted = true;
            await story.save();
        }
    }

    console.log("🏁 Daily automated generation task completed.");
}

module.exports = { runDailyTasks };
