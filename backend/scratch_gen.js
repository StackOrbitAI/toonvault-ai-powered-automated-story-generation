const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Story = require('./models/Story');

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function generate() {
    try {
        await mongoose.connect('mongodb://mongo:27017/toonvault');
        console.log("Connected to DB");

        const topic = "Secret Romance in the Royal Palace";
        const prompt = "A steamy and emotional story about a forbidden love between a princess and her guard.";

        // 1. Mistral
        console.log("Calling Mistral...");
        const mistralResp = await axios.post('https://api.mistral.ai/v1/chat/completions', {
            model: "mistral-small-latest",
            messages: [{
                role: "system",
                content: "You are an adult webtoon story writer specializing in mature, steamy romance and drama. Output ONLY a JSON object with: title, description, and an array 'panels' (length 5) where each item has 'text' (dialogue/narration) and 'imagePrompt' (detailed visual description for Flux AI)."
            }, {
                role: "user",
                content: `Create a highly mature Manta-style webtoon story about: ${topic}. It can include steamy or sensual themes. Context: ${prompt}`
            }],
            response_format: { type: "json_object" }
        }, { headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` } });

        const aiOutput = JSON.parse(mistralResp.data.choices[0].message.content);
        const { title, description, panels: storyPanels } = aiOutput;

        // 2. Runware
        console.log("Calling Runware...");
        const runwareTasks = [
            { taskType: "authentication", apiKey: process.env.RUNWARE_API_KEY },
            ...storyPanels.map((p, idx) => ({
                taskType: "imageInference",
                taskUUID: uuidv4(),
                model: "flux-schnell",
                positivePrompt: `beautiful manhwa style, ${p.imagePrompt}`,
                width: 512,
                height: 768,
                numberResults: 1
            }))
        ];

        const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (runwareResp.data.errors && runwareResp.data.errors.length > 0) {
            console.error("RUNWARE ERRORS:", JSON.stringify(runwareResp.data.errors, null, 2));
            process.exit(1);
        }

        const imageUrls = runwareResp.data.data
            .filter(d => d.taskType === "imageInference")
            .map(d => d.imageURL);

        if (imageUrls.length === 0) {
            console.error("No images generated");
            process.exit(1);
        }

        const newStory = new Story({
            title: title || topic,
            genre: "Romance",
            authorId: "admin",
            authorName: "Admin",
            status: 'Live',
            type: 'Comic',
            description: description,
            content: JSON.stringify(storyPanels),
            panels: imageUrls,
            coverIcon: "✨",
            views: 1200,
            likes: 450,
            rating: 4.8
        });

        await newStory.save();
        console.log("STORY_GENERATED_ID:" + newStory._id);
        process.exit(0);
    } catch (err) {
        if (err.response) {
            console.error("API ERROR DATA:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("ERROR:", err.message);
        }
        process.exit(1);
    }
}

generate();
