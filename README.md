<br># ToonVault 🎭

**ToonVault** is a professional AI-powered interactive storytelling and webtoon/manhwa platform — where readers read stories with cinematic panel overlays, quotes, and an episode-by-episode reading experience. Creators use Runware AI and Mistral AI to generate stunning Manhwa-style story panels automatically.

🌐 **Live Demo:** [toonvault.com](http://toonvault.com/)

---

## ✨ Features

### For Readers
- 📖 **Vertical Scroll Reader** — Webtoon/Manhwa-style full-width panel reading experience
- 💬 **Quote Overlays** — Each panel displays narration or character dialogue as cinematic overlays
- 🗺️ **Story Map** — Visual quest map of all episodes and scenes with status icons (read/unread/bookmarked)
- 📺 **Episode Navigation** — Previous/Next episode with sticky header and scroll progress bar
- 🔞 **Mature Content Gate** — Age verification modal for 18+ stories
- ⭐ **Rating & Likes** — Real-time like/dislike system with Redis-backed rankings

### For Creators
- 🤖 **AI Story Generator** — Describe a topic → Mistral AI writes the script, Runware AI generates all panels
- 🎨 **ToonVault Manhwa Engine v1** — `runware:100@1` model, 704×1024px, 28 steps, CFG 7 for ultra-detailed Korean manhwa art
- 📝 **Manual Story Tool** — Create and publish custom stories with your own episodes
- 🗂️ **Admin Dashboard** — Manage stories, users, settings, and API keys

### Platform
- 🔐 **JWT Authentication** — Secure login/signup with role-based access (admin/creator/reader)
- 📡 **Real-time Updates** — Socket.IO for live reader counts and notifications
- 🏆 **Live Rankings** — Redis sorted set for real-time story rankings
- 🌐 **Full-Stack Docker** — One-command deployment with Docker Compose

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Databases** | MongoDB (stories/content), PostgreSQL (users/payments), Redis (rankings/sessions) |
| **AI Images** | [Runware AI](https://runware.ai/) — `runware:100@1` (FLUX.1) |
| **AI Writing** | [Mistral AI](https://mistral.ai/) — `mistral-small-latest` |
| **Deployment** | Docker Compose, Nginx (reverse proxy), Let's Encrypt (SSL) |
| **Real-time** | Socket.IO |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)

### 1. Clone the repository
```bash
git clone https://github.com/StackOrbitAI/toonvault.git
cd toonvault
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your API keys
```

Required keys:
- `RUNWARE_API_KEY` — [Get at runware.ai](https://my.runware.ai/)
- `MISTRAL_API_KEY` — [Get at mistral.ai](https://console.mistral.ai/)
- `JWT_SECRET` — Any random 32+ character string

### 3. Start all services
```bash
docker compose up --build
```

The app will be available at **http://localhost**

### 4. (Optional) Local frontend dev with hot reload
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## 🐳 Production Deployment (Docker)

### Full production stack (Nginx + SSL)

```bash
# 1. Set up SSL with Let's Encrypt first
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 2. Copy nginx config
cp nginx/default.conf.example nginx/default.conf
# Edit nginx/default.conf with your domain

# 3. Set environment variables
cp .env.example .env
nano .env  # Fill in all values

# 4. Deploy
docker compose -f docker-compose.prod.yml up -d --build

# 5. View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Services exposed
| Service | Port | Purpose |
|---|---|---|
| Nginx | 80, 443 | Reverse proxy + SSL |
| Backend | 5000 (internal) | REST API |
| Frontend | (internal) | React SPA |
| MongoDB | (internal) | Story content |
| PostgreSQL | (internal) | Users/payments |
| Redis | (internal) | Rankings/sessions |

---

## 📁 Project Structure

```
toonvault/
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── StoryPage.jsx       # Story detail page with episode list
│   │   │   ├── MantaReader.jsx     # Full webtoon panel reader
│   │   │   ├── StoryMap.jsx        # Interactive story quest map
│   │   │   ├── Home.jsx            # Homepage / browse
│   │   │   ├── Header.jsx          # Global navigation
│   │   │   ├── Login.jsx           # Auth page
│   │   │   └── BecomeCreator.jsx   # Creator onboarding
│   │   └── App.jsx
│   └── vite.config.js
│
├── backend/                    # Node.js Express API
│   ├── routes/
│   │   ├── stories.js              # Story CRUD + AI generation
│   │   ├── admin.js                # Admin management
│   │   └── auth.js                 # Authentication
│   ├── models/
│   │   ├── Story.js                # MongoDB story schema
│   │   └── User.js                 # User model
│   ├── middleware/
│   │   ├── auth.js                 # JWT middleware
│   │   └── adminOnly.js            # Admin role guard
│   ├── generate_professional_story.js  # Manual story generator script
│   └── server.js
│
├── nginx/                      # Nginx config templates
├── docker-compose.yml          # Development compose
├── docker-compose.prod.yml     # Production compose
├── .env.example                # Environment variables template
└── README.md
```

---

## 🎨 AI Story Generation

ToonVault uses **ToonVault Manhwa Engine v1** to generate professional stories:

### Automatic (via Admin UI or API)
```bash
POST /api/stories/generate
{
  "topic": "A forbidden romance between a CEO and his employee",
  "genre": "Romance",
  "status": "published"
}
```

### Manual Script
Edit `backend/generate_professional_story.js` with your story details, then run:
```bash
docker cp backend/generate_professional_story.js toonvault-backend-1:/app/
docker exec toonvault-backend-1 node /app/generate_professional_story.js
```

### Engine Settings
| Setting | Value |
|---|---|
| **Model** | `runware:100@1` (FLUX.1) |
| **Resolution** | 704 × 1024 px |
| **Steps** | 28 |
| **CFG Scale** | 7 |
| **Style** | Korean Manhwa / Webtoon |
| **Panels/Episode** | 10 |

---

## 🔌 API Reference

### Stories
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stories` | Get all stories |
| `GET` | `/api/stories/:id` | Get story by ID |
| `POST` | `/api/stories/generate` | AI-generate a story |
| `POST` | `/api/stories/:id/like` | Like a story |
| `GET` | `/api/stories/live/ranking` | Get live rankings |

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Get current user |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform statistics |
| `GET` | `/api/admin/stories` | All stories |
| `DELETE` | `/api/admin/stories/:id` | Delete story |
| `GET` | `/api/admin/users` | All users |
| `GET` | `/api/admin/settings` | Platform settings |

---

## 🔧 Admin Setup

After first launch, register an account and promote it to admin:

```bash
docker exec toonvault-backend-1 node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect('mongodb://mongo:27017/toonvault').then(async () => {
  await User.findOneAndUpdate({ email: 'your@email.com' }, { role: 'admin' });
  console.log('Admin promoted!');
  process.exit(0);
});
"
```

---

## 📸 Screenshots

| Home Page | Story Reader | Story Map |
|---|---|---|
| Browse and discover stories | Cinematic panel reader with quote overlays | Interactive episode quest map |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

- **AI Images** — [Runware AI](https://runware.ai/) (FLUX.1 model)
- **AI Writing** — [Mistral AI](https://mistral.ai/)
- **UI Icons** — [Lucide React](https://lucide.dev/)
- **Animations** — [Framer Motion](https://www.framer.com/motion/)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/StackOrbitAI">StackOrbitAI</a>
  <br/>
  <a href="http://toonvault.com/">toonvault.com</a>
</div>
