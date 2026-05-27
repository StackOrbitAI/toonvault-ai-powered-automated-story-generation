# ToonVault - Interactive Manhwa Storytelling Platform

ToonVault is a state-of-the-art interactive manhwa (webtoon) publishing and reading platform where readers guide the destiny of the characters. Every choice unlocks a custom narrative outcome, live poll trackers, and scroll-triggered vertical comic scroll episodes.

---

## 🌟 Key Features

1. **Immersive Webtoon Scroll Reader**:
   - Continuous vertical scroll format optimized for both desktop and mobile devices.
   - Dynamic **Manhwa Speech Bubbles** that float and slide up into place as the reader scrolls them into view using framer-motion transitions.
   - Scroll progress tracking indicator.

2. **Branching Storyline Outcomes**:
   - Interactive choices (A, B, C) that instantly update narrative speech bubbles on illustrations.
   - **Write Your Own Pathway (Choice D)**: Custom text submission updates dialogues dynamically to explore custom endings.
   - Traversal map permitting readers to advance to subsequent unlocked scenes or navigate back.

3. **Live Polling & Fan Vote Tracker**:
   - Cast a vote instantly upon selecting any branch card.
   - Live result graphs updating percentages with smooth animation.

4. **Dynamic Comments & Social Panels**:
   - Full discussions boards supporting comment likes and nested inline replies.
   - Synchronized follows with creator follower stats.
   - Vault bookmarks letting readers store stories and track current progress.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite), Framer Motion, Lucide Icons, Axios.
* **Backend**: Node.js, Express.js.
* **Primary SQL DB**: PostgreSQL (User management, transaction logs).
* **NoSQL DB**: MongoDB (Chapters, panels metadata, story dialogues).
* **Caching & High-Speed Cache**: Redis (Likes sets, live rankings).
* **WebServer & Proxy**: Nginx (Reverse proxy mapping frontend and API endpoints).
* **Containerization**: Docker, Docker Compose.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
Make sure you have Node.js (v18+) and Docker Desktop installed.

### 1. Clone & Setup
```bash
git clone https://github.com/CodeStackLab/toonvault.git
cd toonvault
```

### 2. Configure Environment variables
Create a `.env` file in the `backend/` directory:
```bash
MISTRAL_API_KEY=your_mistral_ai_key
RUNWARE_API_KEY=your_runware_api_key
```

### 3. Run Locally with Docker
Launch all services (PostgreSQL, MongoDB, Redis, Express backend, React frontend, Nginx proxy):
```bash
docker compose up -d --build
```
Once healthy, open **[http://localhost:8081](http://localhost:8081)** to explore!

---

## 📦 Production Deployment Guide

Deploy to any VPS (Ubuntu/Debian) easily using Docker Compose:

### 1. Install Docker & Compose on VPS
```bash
sudo apt update
sudo apt install docker.io docker-compose-v2 -y
```

### 2. Start Production Containers
```bash
docker compose -f docker-compose.yml up -d --build
```

### 3. Set Up SSL (Let's Encrypt / Certbot)
Generate free, automated SSL certificates for your domain:
```bash
docker compose exec nginx certbot --nginx -d yourdomain.com
```

---

## 📖 Seeding Database
To populate the database with default interactive stories:
```bash
docker compose exec backend node seed_stories.js
```
