const axios = require('axios');
const mongoose = require('mongoose');
const Story = require('./models/Story');
const crypto = require('crypto');

const CONFIG = require('./story_engine.config.json');
const MONGO_URI = 'mongodb://mongo:27017/toonvault';

const WEBTOON_IDEAS = [
  {
    title: "The Duke's Cursed Contract",
    genre: "Romance Fantasy",
    description: "Reincarnated into her favorite novel, she must survive by signing a marriage contract with the villainous Duke—only to realize he's not what the original story claimed.",
    coverBg: "#1a0f2e",
    coverIcon: "💍",
    views: 1200000,
    rating: 4.8,
    likes: 250000,
    isAdult: true,
    episodes: [
      {
        number: 1,
        title: "Episode 1 — A New Life",
        panels: [
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful aristocrat woman waking up in a luxurious 19th-century bedchamber, confused expression, sunlight streaming through heavy velvet curtains, 8k",
            speaker: "Narration",
            text: "When I opened my eyes, I wasn't in my cramped apartment anymore."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, POV looking into an ornate gold mirror, reflection of a stunning silver-haired noblewoman with crimson eyes, shocked expression, 8k",
            speaker: "Narration",
            text: "I had become Elara, the villainess destined to die in chapter three."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, grand ballroom, a dark and handsome Duke with piercing cold eyes and raven hair looking down at her, imposing aura, 8k",
            speaker: "Duke Arion",
            text: "You offered a contract. Let's hear it."
          }
        ]
      },
      {
        number: 2,
        title: "Episode 2 — The Agreement",
        panels: [
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, close up of a glowing magical contract with red wax seal on a dark wooden desk, dramatic lighting, 8k",
            speaker: "Narration",
            text: "The terms were simple. Protect me for one year, and I'll cure your curse."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Duke leaning in close, intense gaze, Elara trying to maintain composure but her cheeks are slightly flushed, romantic tension, 8k",
            speaker: "Duke Arion",
            text: "And if you fail? I will take your soul instead."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Elara smiling confidently, eyes flashing with determination, gorgeous webtoon art, 8k",
            speaker: "Elara",
            text: "Then it's a good thing I don't plan on failing, Your Grace."
          }
        ]
      },
      {
        number: 3,
        title: "Episode 3 — Unforeseen Feelings",
        panels: [
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Duke practicing swordplay in the courtyard, shirt slightly open, sweat glistening, Elara watching from a balcony secretly, 8k",
            speaker: "Narration",
            text: "He was supposed to be a cold-blooded monster. The novel lied."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Duke catching her in his arms as she trips on the stairs, close proximity, surprised expressions, 8k",
            speaker: "Duke Arion",
            text: "Careful. I haven't gotten my payment yet."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Elara looking flustered, heart beating fast (visualized with small glowing hearts), 8k",
            speaker: "Narration",
            text: "My survival plan had one major flaw... I never planned on falling for him."
          }
        ]
      }
    ]
  },
  {
    title: "System: Zero to Overlord",
    genre: "Action",
    description: "In a world where gates open to monstrous dungeons, the weakest F-rank hunter awakens a unique system that lets him steal skills from the dead.",
    coverBg: "#0f172a",
    coverIcon: "⚔️",
    views: 3400000,
    rating: 4.9,
    likes: 890000,
    isAdult: true,
    episodes: [
      {
        number: 1,
        title: "Episode 1 — The Weakest",
        panels: [
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, dark modern fantasy, young male hunter looking exhausted and bloodied in a dark dungeon, holding a broken dagger, glowing blue portal in background, 8k",
            speaker: "Narration",
            text: "They called me the weakest. And today, they proved it."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, giant terrifying shadow monster looming over the injured hunter, sharp teeth, glowing red eyes, 8k",
            speaker: "Narration",
            text: "Betrayed and left for dead in an S-rank gate."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, glowing blue system screen floating in front of his face, digital UI elements, reading 'Conditions met. Necromancer class unlocked.', 8k",
            speaker: "System",
            text: "[Notice: Unique skill 'Soul Devour' has been acquired.]"
          }
        ]
      },
      {
        number: 2,
        title: "Episode 2 — The Awakening",
        panels: [
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, hunter standing up, eyes glowing bright blue, dark aura radiating from his body, holding a shadowy blade, epic anime style, 8k",
            speaker: "Hunter Jin",
            text: "If death is the end for others... for me, it's just the beginning."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, hunter slashing the shadow monster with blinding speed, dynamic action pose, motion blur, 8k",
            speaker: "Narration",
            text: "The power of the fallen became my strength."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, hunter standing over the defeated monster, holding its glowing red core, looking menacing and cool, 8k",
            speaker: "Hunter Jin",
            text: "Who's the weakest now?"
          }
        ]
      },
      {
        number: 3,
        title: "Episode 3 — Return",
        panels: [
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, hunter walking out of the blue portal into a modern city, wearing stylish black tactical gear, looking vastly different and stronger, 8k",
            speaker: "Narration",
            text: "When I walked out of that gate, the world had no idea what was coming."
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, arrogant A-rank hunter looking shocked and terrified as Jin approaches him, 8k",
            speaker: "A-Rank Hunter",
            text: "You... How are you still alive?!"
          },
          {
            prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Jin smiling coldly, eyes glowing, shadow soldiers starting to rise behind him, epic, 8k",
            speaker: "Hunter Jin",
            text: "I died. But I didn't stay dead."
          }
        ]
      }
    ]
  }
];

async function generateWithRunware(panels) {
  const apiKey = process.env.RUNWARE_API_KEY || CONFIG.engine.apiKey;
  const tasks = [
    { taskType: "authentication", apiKey: apiKey },
    ...panels.map(panel => ({
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      model: CONFIG.engine.model,
      positivePrompt: `${CONFIG.storyDefaults.basePositivePrompt}, ${panel.prompt}`,
      negativePrompt: CONFIG.imageSettings.negativePrompt,
      width: CONFIG.imageSettings.width,
      height: CONFIG.imageSettings.height,
      numberResults: 1,
      outputFormat: CONFIG.imageSettings.outputFormat,
      CFGScale: CONFIG.imageSettings.CFGScale,
      steps: CONFIG.imageSettings.steps
    }))
  ];

  const resp = await axios.post(CONFIG.engine.apiEndpoint, tasks, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000
  });

  if (resp.data.errors?.length) throw new Error(JSON.stringify(resp.data.errors[0]));

  return resp.data.data
    .filter(d => d.taskType === "imageInference")
    .map(d => d.imageURL);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected');

    for (const STORY of WEBTOON_IDEAS) {
      console.log(`\n🎨 Generating: "${STORY.title}"`);
      const allEpisodes = [];

      for (const ep of STORY.episodes) {
        console.log(`━━━ ${ep.title} (${ep.panels.length} panels) ━━━`);
        const imageUrls = await generateWithRunware(ep.panels);
        console.log(`✅ ${imageUrls.length} images generated`);

        const contentArr = ep.panels.map((p, i) => ({
          speaker: p.speaker,
          text: p.text,
          imageUrl: imageUrls[i] || ''
        }));

        allEpisodes.push({
          number: ep.number,
          title: ep.title,
          panels: imageUrls,
          content: JSON.stringify(contentArr),
          createdAt: new Date(Date.now() + ep.number * 86400000)
        });
      }

      const newStory = new Story({
        title: STORY.title,
        genre: STORY.genre,
        isAdult: STORY.isAdult,
        coverIcon: STORY.coverIcon,
        coverBg: STORY.coverBg,
        authorId: "admin",
        authorName: "ToonVault Master",
        views: STORY.views,
        rating: STORY.rating,
        likes: STORY.likes,
        status: "Live",
        type: "Comic",
        description: STORY.description,
        panels: allEpisodes[0].panels,
        content: allEpisodes[0].content,
        episodes: allEpisodes
      });

      await newStory.save();
      console.log(`✅ Created Story: ${STORY.title} (ID: ${newStory._id})`);
    }

    console.log('\n🎉 All stories generated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
