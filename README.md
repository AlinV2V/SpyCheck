# 🕵️ SpyCheck (Intruder Check)

> An immersive 3D Sci-Fi Social Deduction browser game set inside an orbital cyberpunk command pod, powered by **React 19**, **Three.js**, and **WebGL**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-00ffaa?style=for-the-badge&logo=githubpages)](https://alinv2v.github.io/SpyCheck/)
[![Build Version](https://img.shields.io/badge/Build-v1.0.30-ffb700?style=for-the-badge)](https://github.com/AlinV2V/SpyCheck)
[![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)

---

## 🌟 Overview

**SpyCheck (Intruder Check)** is a web-based 3D multiplayer social deduction game. Players are stationed at futuristic computer workstations inside a high-tech orbital command room. 

- **Operative Agents** are issued security question prompts to verify their identity.
- An **Intruder / Spy** has infiltrated the facility! The Intruder's security prompt is encrypted, forcing them to blend in by deducing the prompt from other agents' choices.
- Work together during **Debriefing Matrix** sessions to spot suspicious answers, cast votes in the **Accusation Matrix**, and eject the Intruder before security is compromised!

---

## ✨ Key Features

- **🖥️ 100% In-World 3D PC Monitor UI**: All interactive gameplay menus (Questions, Option tiles `[A] [B] [C] [D]`, Discussion Debriefing, Voting Matrix, Victory Banners) render dynamically on 1280x800 HTML5 2D canvas textures mapped to 3D workstation screens with Three.js Raycaster clicking.
- **🛸 Sci-Fi Command Center Scene**: Futuristic 3D room with 6 radial workstation pods, glowing LED trims, dual monitor stands, central holographic cylinder projector, rotating particle clouds, starfield, and dynamic status lighting.
- **🖥️ Per-Desk Individual Displays**: Each desk in the 3D room renders its own dedicated operative status console (`STATION 02 // OPERATIVE: AGENT 02`).
- **🎥 Live 3D Camera Calibration**: Built-in floating live camera pipeline allowing real-time adjustment of Distance Ratio, Height, LookAt Offset, and Field of View (FOV).
- **🔄 Multi-Round Progression Logic**: Multi-round gameplay (Rounds 1–3) with instant Agent victory on catching the Intruder, or advancing rounds on innocent votes.
- **🧹 Automated & Manual Cache Purger**: Built-in build version checker (`v1.0.30`) that unregisters stale ServiceWorkers/caches automatically, plus a top HUD **`[🧹 PURGE CACHE & RELOAD]`** button.
- **🎨 Tactical Hardware Aesthetic**: High-contrast **Tactical Emerald (`#00ff66`)**, **Cyber Gold (`#ffc800`)**, **Obsidian Black (`#050912`)**, and **Pure White (`#ffffff`)** typography.

---

## 🕹️ How to Play

1. **Lobby & Setup**: Configure player count (3–6 players or AI bots) and enter the orbital command center.
2. **Question Phase**: Review your security prompt at your 3D workstation monitor. Choose option **A, B, C, or D** and lock in your answer.
   - *If you are an Agent*: Answer the prompt accurately.
   - *If you are the Intruder*: Your prompt is encrypted! Infer what the question might be based on option choices and blend in.
3. **Intel Debriefing**: Review all submitted answers on the **3D Debriefing Matrix** and debate who gave a suspicious response.
4. **Security Voting**: Select a suspect on the **3D Accusation Matrix** and transmit your vote to eject the Intruder!

---

## 🚀 Quick Start & Local Setup

### Prerequisites

- **Node.js** 18+ (Node 20 recommended)
- **npm** 9+

### 1. Clone the repository

```bash
git clone https://github.com/AlinV2V/SpyCheck.git
cd SpyCheck
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
# App runs at http://localhost:5173
```

### 4. Build for production

```bash
npm run build
```

### 5. Deploy to GitHub Pages

```bash
npm run deploy
```

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **3D Graphics & WebGL**: [Three.js](https://threejs.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Icons & Effects**: [Lucide React](https://lucide.dev/), [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Linter**: [Oxlint](https://oxc.rs/)
- **Deployment**: [GitHub Pages](https://pages.github.com/) (`gh-pages`)

---

## 📁 Repository Structure

```
SpyCheck/
├── public/                # Favicon, sound effects, and static assets
├── src/
│   ├── 3d/
│   │   └── ControlRoomScene.jsx  # Three.js 3D scene, lighting, 2D screen canvas renderer & Raycaster
│   ├── components/        # React UI components (Lobby, AvatarSelector, QuestionHUD, VotingPhase)
│   ├── data/
│   │   └── questionBank.js       # Security questions dataset & prompt alignment generator
│   ├── services/
│   │   └── audio.js              # Sound effects & audio manager
│   ├── App.jsx            # Main state manager, multi-round game engine & HUD header
│   ├── index.css          # Master design system tokens & styles
│   └── main.jsx           # Entry point with build version cache purging (v1.0.30)
├── LICENSE                # MIT Open Source License
└── package.json           # Scripts & project manifest
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
