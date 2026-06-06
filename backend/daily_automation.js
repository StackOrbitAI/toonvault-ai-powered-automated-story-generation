const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'sakura_secret_key_2026';

const CATEGORIES = [
  "Romance", "Fantasy", "Drama", "Action", "Comedy", "Slice of Life", "Sci-Fi", 
  "Supernatural", "Mystery", "Thriller", "BL", "GL", "Historical", "Horror", 
  "Sports", "Superhero", "Heartwarming", "Informative", "Graphic Novel", 
  "Mature 18+", "Adventure"
];

// Helper to delay execution
const delay = ms => new Promise(res => setTimeout(res, ms));

async function runDailyAutomation() {
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Daily Story & Episode Generation Automation`);
  console.log(`======================================================\n`);

  // Create an admin token to authenticate our API requests
  const token = jwt.sign({ id: 'admin_id', role: 'admin', username: 'DailyAutoBot' }, JWT_SECRET, { expiresIn: '1h' });
  const headers = { Authorization: `Bearer ${token}` };

  for (const category of CATEGORIES) {
    console.log(`\n-----------------------------------------`);
    console.log(`⚙️ Processing Category: ${category}`);
    console.log(`-----------------------------------------`);

    try {
      // 1. Generate a brand new story for this category
      console.log(`[${category}] 1/2: Generating new story...`);
      const storyRes = await axios.post(`${API_BASE}/stories/generate`, {
        topic: `A new ${category} tale`,
        prompt: `Create a captivating ${category} story.`,
        images: 5,
        category: category,
        status: "draft"
      }, { headers, timeout: 300000 }); // 5 min timeout
      console.log(`✅ [${category}] New story created: ${storyRes.data.story?.title} (${storyRes.data.story?._id})`);

      // 2. Fetch existing stories to find one for this category to generate an episode for
      const allStoriesRes = await axios.get(`${API_BASE}/stories/public`);
      const categoryStories = allStoriesRes.data.filter(s => s.genre === category || s.category === category);
      
      if (categoryStories.length > 0) {
        // Pick the most recent story (or any) to continue
        const storyToUpdate = categoryStories[categoryStories.length - 1];
        
        let nextPrompt = `Continue the adventure in an exciting new episode!`;
        if (storyToUpdate.episodes && storyToUpdate.episodes.length > 0) {
            const lastEp = storyToUpdate.episodes[storyToUpdate.episodes.length - 1];
            if (lastEp.choices && lastEp.choices.length > 0) {
                const winningChoice = lastEp.choices.reduce((max, choice) => (choice.votes > max.votes ? choice : max), lastEp.choices[0]);
                nextPrompt = `The users voted for this outcome: "${winningChoice.text}". Make sure the new episode follows this exact path!`;
                console.log(`[${category}] 🏆 Winning vote: "${winningChoice.text}" (${winningChoice.votes || 0} votes)`);
            }
        }

        console.log(`[${category}] 2/2: Generating new episode for story "${storyToUpdate.title}"...`);
        
        const epRes = await axios.post(`${API_BASE}/stories/generate-episode`, {
          storyId: storyToUpdate._id,
          prompt: nextPrompt
        }, { headers, timeout: 300000 });
        console.log(`✅ [${category}] New episode created for ${storyToUpdate.title}.`);
      } else {
        console.log(`⚠️ [${category}] No existing stories found to generate an episode for.`);
      }

    } catch (err) {
      console.error(`❌ [${category}] Failed during generation.`);
      console.error(err.response?.data || err.message);
    }

    // 3. Wait 30 seconds before next category to prevent rate limiting
    console.log(`⏳ Waiting 30 seconds before next category...`);
    await delay(30000);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Daily Story & Episode Generation Completed!`);
  console.log(`======================================================\n`);
}

runDailyAutomation();
