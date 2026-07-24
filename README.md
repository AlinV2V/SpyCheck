# SpyCheck (Intruder Check)

A 3D sci-fi social deduction browser game set in a virtual command center, built with React 19, Three.js, and WebGL.

Live Demo: https://alinv2v.github.io/SpyCheck/

## Overview

SpyCheck is a web-based social deduction game where players sit at computer workstations inside a command pod.

- Operative Agents receive security questions to verify their identity.
- The Intruder receives encrypted prompt text and must deduce the question from other players' choices.
- Players review submitted answers on debriefing matrix displays and vote to eject suspected intruders.

## Key Features

- In-World 3D Screen Interface: All menus (questions, choices, debriefing, voting, victory screens) render dynamically onto 2D canvas textures mapped to 3D workstation screens using Three.js raycasting.
- Sci-Fi Command Center Environment: 6 radial workstation pods, dual monitor stands, central holographic cylinder, particle effects, and dynamic room lighting.
- Independent Workstation Displays: Each desk screen renders dedicated status information for its assigned player.
- 3D Camera Calibration Pipeline: Floating control panel for live adjustments to camera distance, height, look target, and field of view.
- Multi-Round Match System: Multi-round progression (Rounds 1–3) with victory checks for agents and intruders.
- Cache Management: Automatic version checking to purge stale ServiceWorkers and browser caches.

## Gameplay Flow

1. Lobby: Configure player count (3–6 players or AI bots) and start the session.
2. Question Phase: View security prompt on the 3D monitor, select a response (A, B, C, or D), and lock in.
3. Debriefing: Review all player responses on the 3D matrix and discuss suspicious choices.
4. Voting: Select a suspect on the 3D accusation screen and submit your vote.

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Setup and Running

1. Clone the repository:
   ```bash
   git clone https://github.com/AlinV2V/SpyCheck.git
   cd SpyCheck
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

## Tech Stack

- React 19
- Three.js
- Vite 8
- Lucide React & Canvas Confetti
- Oxlint
- GitHub Pages

## Repository Structure

```
SpyCheck/
├── public/                # Static assets, sound effects, icons
├── src/
│   ├── 3d/
│   │   └── ControlRoomScene.jsx  # Three.js 3D scene, screen canvas renderer, and raycaster
│   ├── components/        # React interface components
│   ├── data/
│   │   └── questionBank.js       # Security questions dataset and prompt generator
│   ├── services/
│   │   └── audio.js              # Sound effects player
│   ├── App.jsx            # State management, game rules, and header
│   ├── index.css          # Design system styles
│   └── main.jsx           # Entry point and cache purger
├── LICENSE                # License file
└── package.json           # Build scripts and dependencies
```

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
