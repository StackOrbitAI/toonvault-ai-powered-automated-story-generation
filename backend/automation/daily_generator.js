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
    
    // RAG Context from Reader Demands
    const demandsContext = (story.readerDemands && story.readerDemands.length > 0) 
        ? `\nCRITICAL FAN DEMANDS TO INCORPORATE: ${story.readerDemands.slice(-5).join(' | ')}`
        : '';

    const prompt = `You are writing episode ${story.episodes.length + 1} for the story titled "${story.title}".
    Genre: ${story.genre}. ${demandsContext}
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

        // Reset demands after fulfilling them
        story.nextEpisodeVotes = 0;
        story.readerDemands = [];

        await story.save();
        console.log(`✅ Added episode to ${story.title}`);
    } catch (e) {
        console.error(`Error adding episode to ${story.title}:`, e.response?.data || e.message);
    }
}

async function runDailyTasks() {
    console.log("🚀 Starting Demand-Driven automated generation task...");

    const today = new Date().getDay();
    // 1. Weekly Binge Story (0 = Sunday)
    if (today === 0) {
        console.log("📅 It's Sunday! Generating the Weekly Binge Story...");
        const newStoryId = await generateNewStory();
        // Since generateNewStory saves a new story but doesn't return the object, we'll fetch the latest one
        const weeklyStory = await Story.findOne().sort({ createdAt: -1 });
        if (weeklyStory && !weeklyStory.isCompleted) {
            console.log(`🚀 Generating remaining episodes for weekly story: ${weeklyStory.title}`);
            const epsToGenerate = weeklyStory.targetEpisodes - weeklyStory.episodes.length;
            for (let i = 0; i < epsToGenerate; i++) {
                await addEpisodeToExisting(weeklyStory);
            }
        }
    } else {
        console.log("📅 Not Sunday. Skipping weekly new story generation.");
    }

    // 2. Demand-Driven Episodes
    // Only update stories that are incomplete AND have at least 10 votes
    const activeStories = await Story.find({ 
        isCompleted: { $ne: true },
        nextEpisodeVotes: { $gte: 10 } 
    });
    
    console.log(`Found ${activeStories.length} active stories that reached the 10-vote demand threshold.`);

    for (const story of activeStories) {
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

    console.log("🏁 Demand-Driven automated generation task completed.");
}

module.exports = { runDailyTasks };
