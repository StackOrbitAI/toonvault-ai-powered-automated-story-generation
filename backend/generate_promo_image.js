const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function generatePromoImage() {
  const RUNWARE_KEY = process.env.RUNWARE_API_KEY;
  if (!RUNWARE_KEY) {
    console.error("❌ RUNWARE_API_KEY not found in .env");
    process.exit(1);
  }

  console.log("🚀 Generating a professional promo image for ToonVault...");

  const tasks = [
    { taskType: "authentication", apiKey: RUNWARE_KEY },
    {
      taskType: "imageInference",
      taskUUID: require('crypto').randomUUID(),
      model: "flux-schnell",
      positivePrompt: "masterpiece, ultra high quality, professional digital art, beautiful manhwa style, a mysterious and elegant woman holding an ancient magical book, cinematic lighting, glowing particles, deep purple and gold theme, 8k resolution, trending on artstation",
      width: 512,
      height: 768,
      numberResults: 1,
      outputFormat: "JPG"
    }
  ];

  try {
    const response = await axios.post('https://api.runware.ai/v1', tasks);
    const result = response.data.data.find(d => d.taskType === "imageInference");
    
    if (result && result.imageURL) {
      console.log(`✅ Image generated successfully!`);
      console.log(`🔗 URL: ${result.imageURL}`);
      
      // We could download it, but just providing the URL is often enough for "generating"
      // However, to be "professional", let's save a reference or just show it.
      fs.writeFileSync('promo_image_url.txt', result.imageURL);
    } else {
      console.error("❌ Failed to generate image:", response.data);
    }
  } catch (err) {
    console.error("❌ API Error:", err.message);
  }
}

generatePromoImage();
