const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const Story = require('./models/Story');
const User = require('./models/User');
const CONFIG = require('./story_engine.config.json');

const MISTRAL_KEY = process.env.MISTRAL_API_KEY || CONFIG.engine.apiKey;
const RUNWARE_KEY = process.env.RUNWARE_API_KEY || CONFIG.engine.apiKey;
const MONGO_URI = 'mongodb://mongo:27017/toonvault';

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

    try {
        const resp = await axios.post(CONFIG.engine.apiEndpoint, runwareTasks, { timeout: 120000 });
        const imgData = resp.data.data.find(d => d.taskType === "imageInference");
        return imgData ? imgData.imageURL : '';
    } catch (e) {
        console.error("Image generation failed:", e.response?.data || e.message);
        return ''; // Fallback to empty string if runware fails
    }
}

async function runBatch() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected for Batch Webtoons Generator");

        const admin = await User.findOne({ role: 'admin' }) || await User.findOne();

        // Array of Webtoons.com inspired genres
        const genres = ["Romance Fantasy", "Action / System", "Thriller", "School Drama", "Isekai", "Supernatural", "Slice of Life", "Sci-Fi", "Comedy", "Historical"];

        // The user asked for "create 10 story"
        const numStoriesToCreate = 10;

        for (let i = 0; i < numStoriesToCreate; i++) {
            const genre = genres[i % genres.length];
            const targetEpisodes = Math.floor(Math.random() * 6) + 5; // Random 5 to 10 episodes

            console.log(`\n=============================================`);
            console.log(`📚 Story ${i + 1}/${numStoriesToCreate} - Genre: ${genre} - Target: ${targetEpisodes} Episodes`);
            console.log(`=============================================`);

            // 1. Generate Concept & Episode 1
            const prompt1 = `You are a world-class manhwa writer on webtoons.com. Generate a completely new story concept for the genre: ${genre}.
            Make it highly engaging, popular webtoon style.
            Output JSON:
            - title: String
            - genre: String
            - description: String
            - isAdult: Boolean (true if mature)
            - episode: Object containing:
                - title: "Episode 1"
                - panels: Array of 3 objects { prompt: "detailed image prompt", text: "narration/dialogue", speaker: "Narration or Character Name" }
            `;

            let storyData;
            try {
                const resp1 = await axios.post('https://api.mistral.ai/v1/chat/completions', {
                    model: "mistral-small-latest",
                    messages: [{ role: "system", content: prompt1 }],
                    response_format: { type: "json_object" }
                }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });
                storyData = JSON.parse(resp1.data.choices[0].message.content);
            } catch (e) {
                console.error("Mistral failed for concept:", e.response?.data || e.message);
                continue;
            }

            console.log(`📝 Generated Concept: ${storyData.title}`);
            console.log(`🎨 Generating Episode 1 images...`);

            const imageUrls1 = [];
            for (const panel of storyData.episode.panels) {
                imageUrls1.push(await generateImage(panel.prompt));
            }

            const contentArr1 = storyData.episode.panels.map((p, idx) => ({
                speaker: p.speaker,
                text: p.text,
                imageUrl: imageUrls1[idx] || ''
            }));

            const newStory = new Story({
                title: storyData.title,
                genre: storyData.genre,
                isAdult: storyData.isAdult || false,
                authorId: admin ? admin._id : "admin",
                authorName: admin ? admin.username : "Webtoon Creator",
                description: storyData.description,
                targetEpisodes: targetEpisodes,
                isCompleted: targetEpisodes === 1,
                coverBg: "#0f172a",
                coverIcon: "✨",
                views: Math.floor(Math.random() * 500000),
                likes: Math.floor(Math.random() * 50000),
                rating: 4.5 + Math.random() * 0.5,
                status: 'Live',
                type: 'Comic',
                panels: [imageUrls1[0]],
                episodes: [{
                    number: 1,
                    title: storyData.episode.title || "Episode 1",
                    panels: imageUrls1,
                    content: JSON.stringify(contentArr1),
                    createdAt: new Date()
                }]
            });

            await newStory.save();
            console.log(`✅ Episode 1 saved!`);

            // 2. Generate remaining episodes in a loop
            for (let epNum = 2; epNum <= targetEpisodes; epNum++) {
                console.log(`📝 Generating Episode ${epNum}/${targetEpisodes} for ${newStory.title}...`);
                const epPrompt = `You are writing episode ${epNum} for the webtoon "${newStory.title}".
                Genre: ${newStory.genre}.
                Output JSON:
                - title: "Episode ${epNum}"
                - panels: Array of 3 objects { prompt: "detailed image prompt", text: "narration/dialogue", speaker: "Narration or Character Name" }
                `;

                try {
                    const epResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
                        model: "mistral-small-latest",
                        messages: [{ role: "system", content: epPrompt }],
                        response_format: { type: "json_object" }
                    }, { headers: { 'Authorization': `Bearer ${MISTRAL_KEY}` } });
                    
                    const epData = JSON.parse(epResp.data.choices[0].message.content);
                    
                    const epImageUrls = [];
                    for (const panel of epData.panels) {
                        epImageUrls.push(await generateImage(panel.prompt));
                    }

                    const epContentArr = epData.panels.map((p, idx) => ({
                        speaker: p.speaker,
                        text: p.text,
                        imageUrl: epImageUrls[idx] || ''
                    }));

                    newStory.episodes.push({
                        number: epNum,
                        title: epData.title || `Episode ${epNum}`,
                        panels: epImageUrls,
                        content: JSON.stringify(epContentArr),
                        createdAt: new Date()
                    });

                    if (newStory.episodes.length >= targetEpisodes) {
                        newStory.isCompleted = true;
                        console.log(`🏆 Story "${newStory.title}" COMPLETED.`);
                    }

                    await newStory.save();
                    console.log(`✅ Episode ${epNum} saved!`);
                } catch (e) {
                    console.error(`Mistral failed for Episode ${epNum}:`, e.response?.data || e.message);
                }
            }
        }
        
        console.log("\n🎉 ALL BATCH WEBTOONS GENERATED SUCCESSFULLY!");
        process.exit(0);

    } catch (err) {
        console.error("Batch Error:", err);
        process.exit(1);
    }
}

runBatch();
