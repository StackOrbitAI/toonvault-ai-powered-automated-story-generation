const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Story = require('./models/Story');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/toonvault';
const RUNWARE_MODEL = process.env.RUNWARE_MODEL || 'runware:100@1';

const story = {
  title: 'Last Platform, First Light',
  description:
    'A quiet station at midnight becomes the start of a soft, cinematic romance between a guarded idol and the designer who refuses to treat him like a headline.',
  episodeTitle: 'Episode 1: The Train That Waited',
  panels: [
    {
      speaker: 'Narration',
      text: 'Some meetings arrive late, then change the entire timetable of your heart.',
      imagePrompt:
        'rainy midnight train station, empty platform, glowing timetable boards, lonely young woman in a cream trench coat holding a sketchbook, cinematic wide shot, soft reflections on wet floor',
    },
    {
      speaker: 'Mira',
      text: 'Last train. Last chance. Please do not be another bad sign.',
      imagePrompt:
        'close-up of a young South Asian fashion designer with expressive eyes, damp hair strands, holding a phone with low battery warning, station lights behind her, emotional manhwa romance panel',
    },
    {
      speaker: 'Narration',
      text: 'Then the city hid its brightest star under a black cap and a tired smile.',
      imagePrompt:
        'handsome young male pop idol in black cap and long dark coat entering train platform quietly, security posters and vending machines in background, cinematic side profile, subtle fame aura',
    },
    {
      speaker: 'Arin',
      text: 'If anyone asks, I am just a passenger who missed his courage.',
      imagePrompt:
        'intimate medium shot of handsome idol lowering his mask slightly, gentle smile, raindrops on glass wall, warm station light, romantic tension, clean linework',
    },
    {
      speaker: 'Mira',
      text: 'Courage usually buys a ticket before the doors close.',
      imagePrompt:
        'two strangers facing each other near open train doors, woman holding sketchbook, man amused and surprised, dramatic train interior glow, vertical webcomic composition',
    },
    {
      speaker: 'Narration',
      text: 'He laughed like someone remembering he was allowed to be human.',
      imagePrompt:
        'close-up of the idol laughing softly, relaxed eyes, blurred platform lights, delicate romantic mood, high detail anime manhwa style',
    },
    {
      speaker: 'Arin',
      text: 'You are not taking a photo?',
      imagePrompt:
        'inside nearly empty late-night train, two characters seated across from each other, city rain streaking windows, soft teal and rose lighting, cinematic quiet atmosphere',
    },
    {
      speaker: 'Mira',
      text: 'No. I am trying to remember a face, not capture a rumor.',
      imagePrompt:
        'woman sketching the idol in her notebook, pencil close-up, idol reflected in train window, tender atmosphere, elegant webtoon romance panel',
    },
    {
      speaker: 'Narration',
      text: 'Between two stations, silence became the safest confession.',
      imagePrompt:
        'wide shot inside train carriage, both looking out opposite windows with shy smiles, overhead handles, passing city lights, dreamy cinematic perspective',
    },
    {
      speaker: 'Arin',
      text: 'When this train ends, can we pretend the night is not over?',
      imagePrompt:
        'dramatic close-up of two hands almost touching on train seat, soft rain light, emotional hesitation, romantic high-quality manhwa style, clean detailed hands',
    },
    {
      speaker: 'Mira',
      text: 'Only if tomorrow meets us without disguises.',
      imagePrompt:
        'train doors opening at dawn, first light flooding platform, woman turning back with gentle confidence, idol standing behind her moved by her words, cinematic sunrise',
    },
    {
      speaker: 'Narration',
      text: 'The last train did not take them home. It carried them toward a beginning.',
      imagePrompt:
        'final vertical romance panel, empty dawn station with two silhouettes walking side by side, soft golden light, hopeful ending, premium manhwa webtoon illustration',
    },
  ],
};

function buildRunwareTasks(apiKey) {
  return [
    { taskType: 'authentication', apiKey },
    ...story.panels.map((panel) => ({
      taskType: 'imageInference',
      taskUUID: crypto.randomUUID(),
      model: RUNWARE_MODEL,
      positivePrompt: [
        'masterpiece',
        'best quality',
        'original modern romance manhwa webtoon art',
        'professional vertical scroll comic panel',
        'cinematic lighting',
        'expressive faces',
        'clean linework',
        'detailed background',
        'safe for work',
        panel.imagePrompt,
      ].join(', '),
      negativePrompt:
        'low quality, blurry, bad anatomy, extra fingers, missing fingers, distorted hands, duplicate characters, watermark, logo, text, speech bubble, cropped face, nude, explicit',
      width: 512,
      height: 768,
      numberResults: 1,
      outputFormat: 'JPG',
      CFGScale: 3.5,
      steps: 4,
      seed: Math.floor(Math.random() * 2147483647),
    })),
  ];
}

async function seedLastPlatformRomance() {
  const apiKey = process.env.RUNWARE_API_KEY;
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY is missing in backend/.env');
  }

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to MongoDB');
  console.log(`Generating ${story.panels.length} panels with ${RUNWARE_MODEL}`);

  let imageUrls = [];
  try {
    const runwareResp = await axios.post('https://api.runware.ai/v1', buildRunwareTasks(apiKey), {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000,
    });

    const errors = runwareResp.data?.errors || [];
    if (errors.length) {
      throw new Error(`Runware errors: ${JSON.stringify(errors)}`);
    }

    imageUrls = (runwareResp.data?.data || [])
      .filter((item) => item.taskType === 'imageInference' && item.imageURL)
      .map((item) => item.imageURL);
  } catch (err) {
    console.warn("⚠️ Runware API call failed. Falling back to high-fidelity AI Image engine (Pollinations):", err.message);
    imageUrls = story.panels.map((p) => {
      const cleanPrompt = `masterpiece, best quality, beautiful modern romance manhwa webtoon art, clean linework, cinematic lighting, ${p.imagePrompt}`;
      const seed = Math.floor(Math.random() * 1000000);
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
    });
  }

  if (imageUrls.length !== story.panels.length) {
    throw new Error(`Expected ${story.panels.length} images, received ${imageUrls.length}`);
  }

  const episode = {
    number: 1,
    title: story.episodeTitle,
    panels: imageUrls,
    content: JSON.stringify(story.panels.map(({ speaker, text }) => ({ speaker, text }))),
    createdAt: new Date(),
  };

  const existing = await Story.findOne({ title: story.title });
  if (existing) {
    existing.description = story.description;
    existing.genre = 'Romance';
    existing.coverIcon = '🚆';
    existing.coverBg = '#111827';
    existing.authorId = 'admin';
    existing.authorName = 'ToonVault AI';
    existing.views = 982000;
    existing.rating = 9.8;
    existing.likes = 214000;
    existing.status = 'Live';
    existing.type = 'Comic';
    existing.isAgeRestricted = false;
    existing.content = episode.content;
    existing.panels = imageUrls;
    existing.episodes = [episode];
    await existing.save();
    console.log(`Updated story: ${existing._id}`);
    console.log(`Reader: https://toonvault.com/manta/${existing._id}`);
    return;
  }

  const newStory = await Story.create({
    title: story.title,
    genre: 'Romance',
    coverIcon: '🚆',
    coverBg: '#111827',
    authorId: 'admin',
    authorName: 'ToonVault AI',
    views: 982000,
    rating: 9.8,
    likes: 214000,
    status: 'Live',
    type: 'Comic',
    isAgeRestricted: false,
    description: story.description,
    content: episode.content,
    panels: imageUrls,
    episodes: [episode],
  });

  console.log(`Created story: ${newStory._id}`);
  console.log(`Story list: https://toonvault.com/story/${newStory._id}`);
  console.log(`Reader: https://toonvault.com/manta/${newStory._id}`);
}

seedLastPlatformRomance()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.response?.data || err.message);
    process.exit(1);
  });
