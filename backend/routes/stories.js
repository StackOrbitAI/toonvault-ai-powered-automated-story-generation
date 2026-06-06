const express = require('express');
const router = express.Router();
const axios = require('axios');
const Story = require('../models/Story');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const redis = require('../redisClient');
const crypto = require('crypto');
const CONFIG = require('../story_engine.config.json');

// Get all stories
router.get('/', async (req, res) => {
    try {
        const stories = await Story.find().sort({ views: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific story by ID
router.get('/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        
        // Track view asynchronously
        Story.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
        
        res.json(story);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update story status (Approve/Reject)
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const story = await Story.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(story);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Like a story
router.post('/:id/like', auth, async (req, res) => {
    try {
        const storyId = req.params.id;
        const userId = req.user.id;
        
        // Prevent duplicate likes
        const hasLiked = await redis.sismember(`story:${storyId}:likes_set`, userId);
        if (hasLiked) {
            return res.status(400).json({ message: 'Already liked this story' });
        }

        // Check if disliked previously, if so, remove dislike
        const hasDisliked = await redis.sismember(`story:${storyId}:dislikes_set`, userId);
        if (hasDisliked) {
            await redis.srem(`story:${storyId}:dislikes_set`, userId);
            await redis.decr(`story:${storyId}:dislikes`);
        }

        // Add like
        await redis.sadd(`story:${storyId}:likes_set`, userId);
        const newLikes = await redis.incr(`story:${storyId}:likes`);
        
        // Update ranking score (+1)
        await redis.zincrby('story_ranking', 1, storyId);
        
        // Sync to MongoDB async
        Story.findByIdAndUpdate(storyId, { $inc: { likes: 1 } }).exec();

        res.json({ message: 'Story liked', likes: newLikes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dislike a story
router.post('/:id/dislike', auth, async (req, res) => {
    try {
        const storyId = req.params.id;
        const userId = req.user.id;
        
        // Prevent duplicate dislikes
        const hasDisliked = await redis.sismember(`story:${storyId}:dislikes_set`, userId);
        if (hasDisliked) {
            return res.status(400).json({ message: 'Already disliked this story' });
        }

        // Check if liked previously, if so, remove like
        const hasLiked = await redis.sismember(`story:${storyId}:likes_set`, userId);
        if (hasLiked) {
            await redis.srem(`story:${storyId}:likes_set`, userId);
            await redis.decr(`story:${storyId}:likes`);
            // Remove +1 from ranking
            await redis.zincrby('story_ranking', -1, storyId);
        }

        // Add dislike
        await redis.sadd(`story:${storyId}:dislikes_set`, userId);
        const newDislikes = await redis.incr(`story:${storyId}:dislikes`);
        
        // Update ranking score (-1)
        await redis.zincrby('story_ranking', -1, storyId);
        
        // Sync to MongoDB async
        Story.findByIdAndUpdate(storyId, { $inc: { dislikes: 1 } }).exec();

        res.json({ message: 'Story disliked', dislikes: newDislikes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Live Ranking
router.get('/live/ranking', async (req, res) => {
    try {
        // Fetch top 10 stories by rank score
        const topStoriesIds = await redis.zrevrange('story_ranking', 0, 9, 'WITHSCORES');
        const ranking = [];
        
        for (let i = 0; i < topStoriesIds.length; i += 2) {
            const storyId = topStoriesIds[i];
            const score = topStoriesIds[i+1];
            // Get likes & dislikes from Redis
            const likes = await redis.get(`story:${storyId}:likes`) || 0;
            const dislikes = await redis.get(`story:${storyId}:dislikes`) || 0;
            
            // Try fetching story details from MongoDB to enrich response
            const storyDetails = await Story.findById(storyId).select('title genre authorName coverIcon');
            
            if (storyDetails) {
                ranking.push({
                    storyId,
                    title: storyDetails.title,
                    genre: storyDetails.genre,
                    author: storyDetails.authorName,
                    cover: storyDetails.coverIcon,
                    score: parseInt(score),
                    likes: parseInt(likes),
                    dislikes: parseInt(dislikes)
                });
            }
        }
        
        res.json(ranking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Generation Route for Stories (Toon Panels)
router.post('/generate', auth, async (req, res) => {
    const { topic, prompt, images, category, genre, status } = req.body;
    const finalCategory = category || genre;
    const finalTopic = topic || prompt?.slice(0, 40) || "Late Night Train Romance";
    
    try {
        let systemPrompt = "";
        let userPrompt = "";

        const genreList = "Romance, Fantasy, Drama, Action, Comedy, Slice of Life, Sci-Fi, Supernatural, Mystery, Thriller, BL, GL, Historical, Horror, Sports, Superhero, Heartwarming, Informative, Graphic Novel, Mature 18+, Adventure";
        
        if (finalCategory === "Quotes") {
            systemPrompt = `You are a world-class creator of aesthetic wisdom. Your output MUST be a JSON object with: title, description, genre (must be exactly "Informative" or "Heartwarming"), and an array 'panels' (length 5). Each panel must have 'text' (a profound quote) and 'imagePrompt' (unique, minimalist cinematic photography for Flux, each with a different setting).`;
            userPrompt = `Curate a masterpiece collection of 5 deep, aesthetic quotes focused on: "${finalTopic}". Theme details: ${prompt || 'Universal wisdom'}. Ensure the quotes are unique and impactful.`;
        } else if (finalCategory?.toLowerCase() === "romance") {
            systemPrompt = `You are a master of emotional Romance Manhwa (webtoon) writing. Your output MUST be a JSON object with: title, description, genre (pick exactly one from: ${genreList}), an array 'panels' (length 10), and an array 'choices' (length 2) representing voting options for what the protagonist should do next (e.g. [{ text: "Talk to him" }, { text: "Run away" }]). Write for a seamless vertical scroll format. Every panel must contain: 'speaker' (either 'Narration' or character name), 'text' (dialogue/quote), and 'imagePrompt' (unique detailed visual description for FLUX model focusing on high-fidelity, safe-for-work content).`;
            userPrompt = `Draft a fluttering, heartwarming 10-panel late-night Romance Webtoon pilot episode about: "${finalTopic}". Theme details and plot hooks: ${prompt || 'A fateful commute meeting'}. Focus on cinematic visual storytelling, soft romantic tension, deep quotes, and relatable character dynamics.`;
        } else {
            systemPrompt = `You are an elite Manhwa (webtoon) writer. Your output MUST be a JSON object with: title, description, genre (pick exactly one from: ${genreList}), an array 'panels' (length 10), and an array 'choices' (length 2) representing voting options for what should happen next (e.g. [{ text: "Fight the monster" }, { text: "Hide" }]). CRITICAL: Write for a seamless vertical scroll format. Use very short, punchy dialogue. Every panel must have a unique, distinct 'imagePrompt' (establishing shots, extreme close-ups, dynamic action) to ensure a professional Webtoon flow. Avoid visual repetition.`;
            userPrompt = `Draft a high-stakes, professionally structured 10-panel Webtoon/Manhwa pilot episode about: "${finalTopic}". Plot hooks: ${prompt || 'A fateful encounter'}. Focus on cinematic visual storytelling, fast pacing, and emotional tension.`;
        }

        // 1. Generate Narrative & Prompts using Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: systemPrompt
            }, {
                role: "user",
                content: userPrompt
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { title, description, genre: aiGenre, panels: storyPanels, choices } = aiOutput;
        const validGenre = aiGenre || finalCategory || "Fantasy";
        const generatedChoices = choices || [{ text: "Continue the story", votes: 0 }, { text: "Add a plot twist", votes: 0 }];

        // Lock in a character seed for visual consistency across all future episodes
        const characterSeed = Math.floor(Math.random() * 2147483647);

        // 2. Generate Images using Runware (FLUX.1 [schnell]) with robust fallback
        let imageUrls = [];
        try {
            if (!process.env.RUNWARE_API_KEY) {
                throw new Error("No Runware API Key provided in .env");
            }
            const runwareTasks = [
                { taskType: "authentication", apiKey: process.env.RUNWARE_API_KEY },
                ...storyPanels.map((p, idx) => ({
                    taskType: "imageInference",
                    taskUUID: crypto.randomUUID(),
                    model: "runware:100@1", // Always use best model
                    positivePrompt: finalCategory === "Quotes" 
                        ? `masterpiece, minimalist aesthetic, cinematic photography, high contrast, moody lighting, elegant atmosphere, ultra-detailed, ${p.imagePrompt}`
                        : `masterpiece, ultra-detailed Korean manhwa webtoon style, beautiful anime aesthetic, official webtoon style, dynamic composition, dramatic cinematic lighting, highly detailed character design, clean linework, vibrant colors, ${p.imagePrompt}`,
                    negativePrompt: "blurry, low quality, ugly, bad anatomy, extra limbs, watermark, text overlay, logo, nsfw, bad proportions",
                    width: 512,
                    height: 768,
                    numberResults: 1,
                    outputFormat: "WEBP",
                    seed: characterSeed,
                    CFGScale: 7,
                    steps: 28
                }))
            ];

            const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });

            if (runwareResp.data && runwareResp.data.data) {
                imageUrls = runwareResp.data.data
                    .filter(d => d.taskType === "imageInference" && d.imageURL)
                    .map(d => d.imageURL);
            }

            if (imageUrls.length === 0) {
                const errors = runwareResp.data?.errors || [];
                throw new Error("Runware returned no images. Errors: " + JSON.stringify(errors));
            }
            console.log(`🎨 Successfully generated ${imageUrls.length} images using Runware API.`);
        } catch (runwareError) {
            console.warn("⚠️ Runware API call failed. Falling back to high-fidelity AI Image engine (Pollinations AI):", runwareError.message);
            
            // Fallback: Generate Pollinations AI URLs which generate images on-the-fly
            imageUrls = storyPanels.map((p, idx) => {
                const cleanPrompt = finalCategory === "Quotes"
                    ? `masterpiece, minimalist aesthetic, cinematic photography, high contrast, clean, elegant, ${p.imagePrompt}`
                    : `masterpiece, highly detailed Manhwa style, beautiful anime aesthetic, cinematic lighting, intricate textures, 8k resolution, ${p.imagePrompt}`;
                const seed = Math.floor(Math.random() * 1000000);
                return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
            });
        }

        const isMature = finalCategory?.toLowerCase() === 'mature' || (req.body.status === 'published' && finalCategory?.toLowerCase() === 'mature');
        
        // Build enriched content array with text+speaker for reader overlay
        const enrichedContent = storyPanels.map((p, i) => ({
            speaker: p.speaker || 'Narration',
            text: p.text || '',
            imageUrl: imageUrls[i] || ''
        }));
        
        const newStory = new Story({
            title: title || finalTopic || "Untitled Story",
            genre: validGenre,
            authorId: req.user.id,
            authorName: req.user.username || "Creator",
            status: status === 'published' ? 'Live' : 'Draft',
            type: 'Comic',
            description: description,
            isAgeRestricted: isMature,
            content: JSON.stringify(enrichedContent), // enriched with speaker + text for overlay
            panels: imageUrls,
            coverIcon: "✨",
            characterSeed: characterSeed,
            episodes: [{
                number: 1,
                title: title || finalTopic || "Episode 1",
                panels: imageUrls,
                content: JSON.stringify(enrichedContent),
                choices: generatedChoices
            }]
        });

        await newStory.save();
        res.json({ message: "Story generated successfully!", story: newStory });
    } catch (err) {
        if (err.response) {
            console.error("AI Generation API Error Response:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("AI Generation Error (No Response):", err.message);
        }
        res.status(500).json({ error: "Failed to generate story with AI. " + (err.response?.data?.message || err.message) });
    }
});

// AI Generation Route for Articles
router.post('/generate-article', auth, async (req, res) => {
    const { topic, tone, genre, length } = req.body;
    
    try {
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "user",
                content: `Write a ${tone} ${genre} article about "${topic}". Length: ${length}.`
            }]
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const content = mistralResp.data.choices[0].message.content;

        const newArticle = new Story({
            title: topic || "AI Article",
            genre: genre,
            authorId: req.user.id,
            authorName: req.user.username || "Writer",
            status: 'Live',
            type: 'Article',
            content: content,
            description: `A ${tone} piece about ${topic}`,
            coverIcon: "✍️"
        });

        await newArticle.save();
        res.json({ message: "Article generated successfully!", article: newArticle });
    } catch (err) {
        console.error("AI Article Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to generate article with AI" });
    }
});

// AI Generation Route for Next Episodes
router.post('/generate-episode', auth, async (req, res) => {
    const { storyId, prompt: userPrompt } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (user.coins < 10) {
            return res.status(402).json({ error: "Insufficient ToonCoins. Generating an episode costs 10 coins." });
        }

        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ error: "Story not found" });

        // Continuity Context: Feed previous dialogues & panels to maintain strict narrative alignment
        let previousEpisodesContext = "";
        if (story.episodes && story.episodes.length > 0) {
            previousEpisodesContext = story.episodes.map(ep => {
                let panelsText = "";
                try {
                    const parsed = JSON.parse(ep.content);
                    if (Array.isArray(parsed)) {
                        panelsText = parsed.map(p => `${p.speaker}: "${p.text}"`).join('\n');
                    } else {
                        panelsText = ep.content;
                    }
                } catch (e) {
                    panelsText = ep.content || "";
                }
                return `--- Episode ${ep.number}: ${ep.title} ---\n${panelsText}`;
            }).join('\n\n');
        } else {
            try {
                const parsed = JSON.parse(story.content);
                if (Array.isArray(parsed)) {
                    previousEpisodesContext = `--- Episode 1 ---\n` + parsed.map(p => `${p.speaker}: "${p.text}"`).join('\n');
                }
            } catch (e) {}
        }

        const context = `This is the next episode of the story "${story.title}". 
        Summary: ${story.description}. 
        
        Previous Episodes History:
        ${previousEpisodesContext}
        
        User wants this to happen in the next episode: ${userPrompt || "Continue the plot naturally."}
        
        CRITICAL: Maintain strict continuity with character names, their speech style, and plot details from the history listed above.`;

        // 1. Generate next episode content with Mistral
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are a professional Manhwa scriptwriter specializing in high-tension drama and fantasy. Your task is to write the NEXT episode of an existing series. Ensure narrative continuity, character development, and emotional impact. Output ONLY a JSON object with: episodeTitle, an array 'panels' (length 10) where each item has 'text' (short punchy dialogue) and 'imagePrompt' (detailed cinematic description), and an array 'choices' (length 2) representing voting options for what should happen next (e.g. [{ text: 'Fight the monster' }, { text: 'Hide' }]). CRITICAL: Write for a seamless vertical scroll format. Every panel must have a unique, distinct 'imagePrompt' that varies in composition."
            }, {
                role: "user",
                content: context
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { episodeTitle, panels: storyPanels, choices } = aiOutput;
        const generatedChoices = choices || [{ text: "Continue the story", votes: 0 }, { text: "Add a plot twist", votes: 0 }];

        // Ensure character seed exists for consistency
        let characterSeed = story.characterSeed;
        if (!characterSeed) {
            characterSeed = Math.floor(Math.random() * 2147483647);
            story.characterSeed = characterSeed;
        }

        // 2. Generate Images with robust fallback
        let imageUrls = [];
        try {
            if (!process.env.RUNWARE_API_KEY) {
                throw new Error("No Runware API Key provided in .env");
            }
            const runwareTasks = [
                { taskType: "authentication", apiKey: process.env.RUNWARE_API_KEY },
                ...storyPanels.map((p, idx) => ({
                    taskType: "imageInference",
                    taskUUID: crypto.randomUUID(),
                    model: CONFIG.engine.model || "runware:100@1",
                    positivePrompt: `${CONFIG.storyDefaults.basePositivePrompt || "masterpiece, ultra-detailed Korean manhwa webtoon art"}, ${p.imagePrompt}`,
                    negativePrompt: CONFIG.imageSettings.negativePrompt || "blurry, low quality, distorted",
                    width: CONFIG.imageSettings.width || 704,
                    height: CONFIG.imageSettings.height || 1024,
                    numberResults: CONFIG.imageSettings.numberResults || 1,
                    outputFormat: CONFIG.imageSettings.outputFormat || "WEBP",
                    seed: characterSeed,
                    CFGScale: CONFIG.imageSettings.CFGScale || 7,
                    steps: CONFIG.imageSettings.steps || 28
                }))
            ];

            const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });

            if (runwareResp.data && runwareResp.data.data) {
                imageUrls = runwareResp.data.data
                    .filter(d => d.taskType === "imageInference" && d.imageURL)
                    .map(d => d.imageURL);
            }

            if (imageUrls.length === 0) {
                const errors = runwareResp.data?.errors || [];
                throw new Error("Runware returned no images. Errors: " + JSON.stringify(errors));
            }
            console.log(`🎨 Successfully generated ${imageUrls.length} next episode images using Runware API.`);
        } catch (runwareError) {
            console.warn("⚠️ Runware API call failed for next episode. Falling back to high-fidelity AI Image engine (Pollinations AI):", runwareError.message);
            
            // Fallback: Generate Pollinations AI URLs which generate images on-the-fly
            imageUrls = storyPanels.map((p, idx) => {
                const cleanPrompt = `masterpiece, best quality, ultra-detailed, beautiful manhwa style, dramatic immersive webtoon aesthetic, safe for work, rich vibrant colors, cinematic lighting, ${p.imagePrompt}`;
                const seed = Math.floor(Math.random() * 1000000);
                return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
            });
        }

        const episodeNumber = story.episodes && story.episodes.length > 0 
            ? (Math.max(...story.episodes.map(e => e.number || 0)) + 1) 
            : 2; 
        
        const newEpisode = {
            number: episodeNumber,
            title: episodeTitle || `Episode ${episodeNumber}`,
            panels: imageUrls,
            content: JSON.stringify(storyPanels),
            choices: generatedChoices
        };

        story.episodes.push(newEpisode);
        await story.save();

        user.coins -= 10;
        await user.save();

        res.json({ message: "Next episode generated successfully!", episode: newEpisode, coinsRemaining: user.coins });
    } catch (err) {
        console.error("Episode Gen Error:", err.message);
        res.status(500).json({ error: "Failed to generate next episode: " + err.message });
    }
});

// Record a vote for the next episode
router.post('/:storyId/episode/:episodeNumber/vote', auth, async (req, res) => {
    try {
        const { storyId, episodeNumber } = req.params;
        const { choiceIndex } = req.body;
        
        const user = await User.findById(req.user.id);
        if (user.coins < 1) {
            return res.status(402).json({ error: "Insufficient ToonCoins. Voting costs 1 coin." });
        }

        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ error: "Story not found" });
        
        const episode = story.episodes.find(ep => ep.number === parseInt(episodeNumber));
        if (!episode) return res.status(404).json({ error: "Episode not found" });
        
        if (!episode.choices || !episode.choices[choiceIndex]) {
            return res.status(400).json({ error: "Invalid choice index" });
        }
        
        // Ensure user hasn't voted already (simple implementation using Redis)
        const userId = req.user.id;
        const voteKey = `vote:${storyId}:${episodeNumber}:${userId}`;
        const hasVoted = await redis.get(voteKey);
        
        if (hasVoted) {
            return res.status(400).json({ message: "You have already voted for this episode's next path!" });
        }
        
        // Record vote
        episode.choices[choiceIndex].votes = (episode.choices[choiceIndex].votes || 0) + 1;
        await story.save();
        
        // Prevent double voting for 24h
        await redis.setex(voteKey, 86400, "1");
        
        user.coins -= 1;
        await user.save();

        res.json({ message: "Vote recorded successfully", choices: episode.choices, coinsRemaining: user.coins });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Real-time Translation Endpoint
router.post('/:storyId/episode/:episodeNumber/translate', auth, async (req, res) => {
    try {
        const { storyId, episodeNumber } = req.params;
        const { targetLanguage } = req.body;

        if (!targetLanguage) {
            return res.status(400).json({ error: "Target language is required" });
        }

        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ error: "Story not found" });

        const episode = story.episodes.find(ep => ep.number === parseInt(episodeNumber));
        const episodeData = episode || story; // Fallback for single episode stories without the episodes array
        
        let contentToTranslate;
        try {
            contentToTranslate = JSON.parse(episodeData.content);
        } catch (e) {
            return res.status(400).json({ error: "Content is not in valid JSON format" });
        }

        const choicesToTranslate = episodeData.choices || [];

        // Prepare data structure for translation
        const payload = {
            panels: contentToTranslate.map(p => ({ text: p.text })),
            choices: choicesToTranslate.map(c => ({ text: c.text }))
        };

        const systemPrompt = `You are an expert comic book and webtoon translator. Translate the provided text into ${targetLanguage}. 
Maintain the dramatic tone, brevity, and emotional weight of the original. 
Output MUST be a JSON object with two arrays: 'panels' (translated text for each panel) and 'choices' (translated text for each choice). 
Format: { "panels": [{ "text": "..." }], "choices": [{ "text": "..." }] }`;

        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(payload) }
            ],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);

        res.json({ 
            message: "Translated successfully",
            translatedPanels: aiOutput.panels,
            translatedChoices: aiOutput.choices
        });

    } catch (err) {
        console.error("Translation error:", err.message);
        res.status(500).json({ error: "Translation failed" });
    }
});

// Demand next episode
router.post('/:id/demand', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        
        const { demand } = req.body;
        story.nextEpisodeVotes += 1;
        if (demand && demand.trim() !== '') {
            story.readerDemands.push(demand);
        }
        await story.save();
        res.json({ message: 'Demand saved', nextEpisodeVotes: story.nextEpisodeVotes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
