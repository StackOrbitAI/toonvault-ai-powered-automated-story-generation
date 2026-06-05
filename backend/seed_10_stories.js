const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const Story = require('./models/Story');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/toonvault';
const RUNWARE_KEY = process.env.RUNWARE_API_KEY;

// ── STORIES DEFINITION (INSPIRED BY TOP WEBTOONS) ──────────────────────────
const STORIES_DATA = [
  {
    title: "Lore of the Underworld",
    genre: "Romance",
    description: "A modern retelling of the myth of Persephone and Hades, set in a glowing neon underworld of corporate gods and ancient secrets.",
    coverIcon: "🏛️",
    coverBg: "#0B0C10",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Persephone as a beautiful pink goddess with flower crown, glowing pink eyes, standing under neon streetlights of the Underworld, 8k",
        speaker: "Narration",
        text: "I thought the Underworld was a place of shadows. I didn't expect it to glow."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Hades as a tall handsome king with sharp blue hair, wearing a fitted black suit, standing next to a sleek black car, neon purple background, 8k",
        speaker: "Narration",
        text: "Hades. The king of corporate gods. Cold, distant, and completely out of my league."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, close-up of a glowing pink hand holding a dark blue hand, romantic tension, sparks of neon light, 8k manhwa illustration",
        speaker: "Persephone",
        text: "If I touch you... will I lose my spring?"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Hades looking down at Persephone with a pained but intense look, warm neon bar lighting, dramatic shadows, 8k",
        speaker: "Hades",
        text: "You should go back to the surface. I am no good for flowers."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Persephone stepping closer to Hades, looking up defiantly, neon skyline glittering behind them, 8k",
        speaker: "Persephone",
        text: "I am tired of the sun. Let me burn in your shadows."
      }
    ]
  },
  {
    title: "The Empress's Second Chance",
    genre: "Fantasy",
    description: "Divorced by her unfaithful emperor husband, Empress Navier requests a divorce and immediate permission to remarry a foreign king.",
    coverIcon: "👑",
    coverBg: "#1C1427",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful empress Navier with long golden hair, wearing a white and gold royal gown, cold determined expression, grand marble throne room, 8k",
        speaker: "Navier",
        text: "I accept the divorce. And I request permission for my remarriage."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, shock expression on an unfaithful emperor with dark hair, gold crown, gasping audience in the background, 8k",
        speaker: "Sovieshu",
        text: "Remarriage? With whom?!"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, tall handsome prince Heinrey with golden-blonde hair and bright blue eyes, smiling warmly, stepping forward to stand next to Navier, 8k",
        speaker: "Heinrey",
        text: "With me, Your Majesty. I would be honored to have her as my Queen."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Navier looking up at Heinrey with surprise, Heinrey holding her hand gently, warm backlit sunlight through cathedral windows, 8k",
        speaker: "Navier",
        text: "He was always a playful prince. I didn't know he was serious."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Navier and Heinrey striding out of the courtroom side by side, their capes billowing, Sovieshu watching in rage, 8k",
        speaker: "Narration",
        text: "Some crowns are meant to be broken. Others are meant to be shared."
      }
    ]
  },
  {
    title: "Level Up Alone",
    genre: "Action",
    description: "The weakest hunter in the world gains a unique ability to level up alone in dangerous dungeons, unlocking godlike power.",
    coverIcon: "⚔️",
    coverBg: "#050B14",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, weak hunter Jinwoo with messy black hair, clutching a broken dagger, surrounded by giant blue monster statues in a dark stone temple, 8k",
        speaker: "Narration",
        text: "I was the weakest. The hunter everyone left behind."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, glowing blue hologram screen reading 'You have leveled up!', Jinwoo staring in disbelief, glowing blue eyes, 8k",
        speaker: "Jinwoo",
        text: "A quest? In my head? No one else can see this."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Jinwoo dodging a massive wolf claw, sharp swift motion lines, dynamic action shot, glowing blue daggers in both hands, 8k",
        speaker: "Narration",
        text: "No party. No guilds. Just me, climbing the ranks alone."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, close-up of Jinwoo's cold glowing eyes, dark aura rising from his body, summoning dark shadow soldiers, 8k",
        speaker: "Jinwoo",
        text: "Arise."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Jinwoo standing at the top of a skyscraper overlooking a ruined city, shadow army kneeling behind him, epic sky, 8k",
        speaker: "Narration",
        text: "The world wanted me dead. Now, they look up to me."
      }
    ]
  },
  {
    title: "True Reflection",
    genre: "Drama",
    description: "A shy high schooler masters the art of makeup, transforming into a goddess online, but hides her true face from her classmates.",
    coverIcon: "💄",
    coverBg: "#FAF3F0",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, shy girl Jugyeong with glasses and messy bun, looking sadly at her acne-covered face in a mirror, 8k",
        speaker: "Jugyeong",
        text: "They call me ugly. High school is going to be a nightmare."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Jugyeong applying makeup with brushes, palette in hand, intense focus, soft pink bedroom lighting, 8k",
        speaker: "Narration",
        text: "I spent the entire summer break studying makeup tutorials. Every single night."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, gorgeous girl Jugyeong with large brown eyes and long wavy brown hair, wearing a high school uniform, walking down a campus path, cherry blossoms, 8k",
        speaker: "Narration",
        text: "The first day of school. Nobody recognized me. I was a goddess."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, a tall handsome boy Suho with cold eyes, catching Jugyeong at a comic store without makeup, both shocked, 8k",
        speaker: "Suho",
        text: "You... look familiar. Have we met?"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Jugyeong covering her face in panic, Suho looking at her curiously, warm manga bookstore light, 8k",
        speaker: "Jugyeong",
        text: "My secret is out. My double life begins."
      }
    ]
  },
  {
    title: "Sweet Quarantine",
    genre: "Horror",
    description: "A reclusive teenager is trapped in his apartment building when humans suddenly begin turning into monsters representing their inner desires.",
    coverIcon: "🩸",
    coverBg: "#140D0D",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, reclusive boy Hyun alone in a dark cluttered room, lit only by a computer screen, depressive mood, 8k",
        speaker: "Hyun",
        text: "I was waiting for my suicide date. I didn't expect the world to end first."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, a creepy monster with a giant single eye peering through a cracked apartment door, dark hallways, green toxic fumes, 8k",
        speaker: "Narration",
        text: "It wasn't an infection. It was human desire, turning them into monsters."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Hyun holding a spear tipped with a taser, standing protectively in a dark corridor, blue sparks of electricity, 8k",
        speaker: "Hyun",
        text: "If I am going to die... I will die as a human."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, close-up of Hyun's eye turning pitch black, dark veins spreading across his face, fighting the monster inside him, 8k",
        speaker: "Narration",
        text: "I can feel it. The voice inside me, whispering to let go."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, survivors banding together in a lobby, looking up as Hyun stands at the top of the stairs, dramatic low key lighting, 8k",
        speaker: "Narration",
        text: "We are trapped. But we are not giving up."
      }
    ]
  },
  {
    title: "The Duke's Polite Demon",
    genre: "Comedy",
    description: "When a teenager accidentally summons a polite demon lord to get love advice, his high school life becomes a magical battleground.",
    coverIcon: "😈",
    coverBg: "#F5F0F5",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, teenage boy Julius in a messy room, holding an old book, looking shocked as a huge circle of fire appears on the floor, 8k",
        speaker: "Julius",
        text: "I just wanted to know how to ask out my crush! What did I summon?!"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, a tall handsome demon lord in a tuxedo, with red skin and neat horns, bowing politely and holding a tray with tea, 8k",
        speaker: "Duke Bael",
        text: "Greetings, young master. I am Duke Bael of the Underworld. How may I assist your romantic endeavors?"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Duke Bael showing Julius a presentation board with chart diagrams about high school girls, serious look, 8k",
        speaker: "Duke Bael",
        text: "Step one: Establish dominance by offering her a freshly harvested soul."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Julius facepalming in embarrassment, demon lord looking confused, funny expressive chibi style inset, 8k",
        speaker: "Julius",
        text: "No! Girls do not like souls! Just write a normal text message!"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Julius walking to school while the giant polite demon floats behind him, invisible to others, holding a magical book of love tips, 8k",
        speaker: "Narration",
        text: "My high school life is officially doomed."
      }
    ]
  },
  {
    title: "Omniscient Reader's Protocol",
    genre: "Sci-Fi",
    description: "A normal salaryman finds himself trapped in the post-apocalyptic world of his favorite web novel, armed with the knowledge of its ending.",
    coverIcon: "📱",
    coverBg: "#0C0F1A",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, salaryman Dokja looking at his phone in a subway car, screen showing the final chapter of a novel, blue subway light, 8k",
        speaker: "Dokja",
        text: "The story is finished. I was the only reader who stayed until the end."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, subway glass shattering, a small floating demon-like creature (dokkaebi) with horns appearing in mid-air, subway in ruins, 8k",
        speaker: "Dokkaebi",
        text: "The free trial of the Earth scenario has ended. The main scenario begins."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Dokja looking calm amidst panicking passengers, a glowing blue screen showing his attributes, 8k",
        speaker: "Dokja",
        text: "I know this scenario. I read this chapter a hundred times."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Dokja facing a tall handsome warrior with a massive sword, glowing blue sword energy, dramatic tension, 8k",
        speaker: "Narration",
        text: "Yoo Joonghyuk. The protagonist of the novel. A regression hero who has died a hundred times."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Dokja smiling slightly as he steps forward, phone screen glowing in his hand, ruins of Seoul behind them, 8k",
        speaker: "Dokja",
        text: "I am the only one who knows the ending of this world."
      }
    ]
  },
  {
    title: "Unholy Awakening",
    genre: "Supernatural",
    description: "A pureblood vampire hides her identity while hunting down the corrupt vampires who destroyed her family.",
    coverIcon: "🧛‍♀️",
    coverBg: "#190F14",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful vampire Hayan with silver hair and glowing red eyes, standing on a rooftop at night, moonlight behind her, 8k",
        speaker: "Hayan",
        text: "I hid for ten years. Pretending to be a normal human."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, corrupt vampire turning to dust as Hayan punches through his chest, high speed action, shards of glass, 8k",
        speaker: "Narration",
        text: "But they kept killing. Turning my city into a hunting ground."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, handsome detective Euntea with short dark hair, pointing a gun at Hayan, standing in an alleyway, rain bokeh, 8k",
        speaker: "Euntea",
        text: "Freeze! You are not a human... what are you?"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Hayan stepping into the light, eyes glowing red, a bittersweet smile, rain dripping from her hair, 8k",
        speaker: "Hayan",
        text: "The monster that is going to save your life. Now step back."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Hayan and Euntea standing back to back as a horde of dark vampires emerges from the shadows, alleyway neon light, 8k",
        speaker: "Narration",
        text: "The hunt has begun."
      }
    ]
  },
  {
    title: "The Serial Killer's Son",
    genre: "Thriller",
    description: "A weak teenager must protect his classmates from his own father, who is secretly a notorious serial killer.",
    coverIcon: "🔨",
    coverBg: "#0F0F0F",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, weak boy Jin with an eye patch, looking terrified at the dinner table, facing his handsome smiling father in a neat suit, 8k",
        speaker: "Father",
        text: "Eat your dinner, Jin. You need to be strong for our next outing."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, a dark basement room, ropes and tools hanging on a wall, a single hanging lightbulb, shadows stretching, 8k",
        speaker: "Narration",
        text: "My father is a model citizen. A successful CEO. And a serial killer."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Jin standing protectively in front of a beautiful transfer student Kyun, looking determined, rain pouring on them, 8k",
        speaker: "Jin",
        text: "I won't let you touch her. She has nothing to do with this."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, close-up of the father's face, smiling but eyes completely empty and cold, holding a hammer, 8k",
        speaker: "Father",
        text: "A good son doesn't keep secrets from his father, Jin."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Jin holding a heavy metal pipe, standing in the dark basement, eyes filled with raw resolve, 8k",
        speaker: "Jin",
        text: "This ends tonight. I will protect them all."
      }
    ]
  },
  {
    title: "My Cozy Giant",
    genre: "Slice of Life",
    description: "Cozy and heartwarming daily life snippets of a petite girl and her giant nerd boyfriend.",
    coverIcon: "🌸",
    coverBg: "#FFF9E6",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, petite girl Lily (height 5ft) standing on a chair to reach a high shelf, looking frustrated, cozy sunny kitchen, 8k",
        speaker: "Lily",
        text: "Just... one... more... inch... why is this shelf so high?!"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, a giant tall boy Sam (height 6.5ft) with glasses and a fluffy sweater, easily picking up the jar from the shelf and handing it to Lily, smiling, 8k",
        speaker: "Sam",
        text: "Need some help down there, shorty?"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Lily hugging Sam's waist, burying her face in his sweater, Sam looking surprised but hugging her back gently, warm cozy lighting, 8k",
        speaker: "Lily",
        text: "You are basically a giant fluffy pillow. I am never letting go."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Lily and Sam sharing a blanket on the couch, eating popcorn while playing video games, warm living room bokeh, 8k",
        speaker: "Sam",
        text: "No cheating, Lily! I saw you look at my controller!"
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, Lily and Sam walking down a park path hand in hand under cherry blossoms, Sam tilting his head down to smile at her, beautiful sunny day, 8k",
        speaker: "Narration",
        text: "Daily life with a giant is filled with small heights and huge happiness."
      }
    ]
  }
];

async function generateWithRunware(panels) {
  if (!RUNWARE_KEY) throw new Error("No Runware API Key provided in env");

  const tasks = [
    { taskType: "authentication", apiKey: RUNWARE_KEY },
    ...panels.map(panel => ({
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      model: "runware:100@1", // FLUX.1 model
      positivePrompt: `masterpiece, ultra-detailed Korean manhwa webtoon art, official webtoon style, dynamic composition, dramatic cinematic lighting, highly detailed character design, clean linework, vibrant colors, ${panel.prompt}`,
      negativePrompt: "blurry, low quality, distorted, bad anatomy, extra limbs, watermark, text, logo, nsfw, ugly, deformed",
      width: 704,
      height: 1024,
      numberResults: 1,
      outputFormat: "WEBP",
      CFGScale: 7,
      steps: 28
    }))
  ];

  const resp = await axios.post('https://api.runware.ai/v1', tasks, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 180000 // 3 minutes timeout for batch
  });

  if (resp.data.errors?.length) throw new Error(JSON.stringify(resp.data.errors[0]));

  return resp.data.data
    .filter(d => d.taskType === "imageInference")
    .map(d => d.imageURL);
}

async function run() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin user as default creator
    const admin = await User.findOne({ role: 'admin' }) || await User.findOne() || { _id: "69e7a4cbbd3f6e75334d5f2d", username: "admin" };
    console.log(`👤 Author assigned: ${admin.username} (${admin._id})`);

    // Clean old stories
    console.log('🧹 Clearing old stories...');
    await Story.deleteMany({});
    console.log('✅ Collection cleared');

    for (let idx = 0; idx < STORIES_DATA.length; idx++) {
      const sData = STORIES_DATA[idx];
      console.log(`\n━━━━ [${idx + 1}/10] Generating Story: "${sData.title}" (${sData.genre}) ━━━━`);

      try {
        const imageUrls = await generateWithRunware(sData.panels);
        console.log(`✅ Generated ${imageUrls.length} images for "${sData.title}"`);

        const contentArr = sData.panels.map((p, i) => ({
          speaker: p.speaker,
          text: p.text,
          imageUrl: imageUrls[i] || ''
        }));

        const firstEpisode = {
          number: 1,
          title: "Episode 1 — Pilot",
          panels: imageUrls,
          content: JSON.stringify(contentArr),
          createdAt: new Date()
        };

        const newStory = new Story({
          title: sData.title,
          genre: sData.genre,
          coverIcon: sData.coverIcon,
          coverBg: sData.coverBg,
          authorId: admin._id.toString(),
          authorName: admin.username,
          views: Math.floor(Math.random() * 500000) + 10000,
          rating: (Math.random() * 0.4 + 4.6).toFixed(1),
          likes: Math.floor(Math.random() * 50000) + 1000,
          status: "Live",
          type: "Comic",
          description: sData.description,
          panels: imageUrls,
          content: JSON.stringify(contentArr),
          episodes: [firstEpisode]
        });

        await newStory.save();
        console.log(`🎉 Saved Story successfully! ID: ${newStory._id}`);
        
        // Wait 3 seconds between batches to avoid rate limit/timeout issues
        await new Promise(r => setTimeout(r, 3000));
      } catch (storyError) {
        console.error(`❌ Failed to generate story "${sData.title}":`, storyError.message);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏁 10 Dynamic Stories Generated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ General Execution Error:', err.message);
    process.exit(1);
  }
}

run();
