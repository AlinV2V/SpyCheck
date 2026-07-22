import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { playClick, playLaserLock, playVoteCast, playTerminalPowerOn } from '../services/audio';

/**
 * Helper function to compute exact 3D position and rotation for each player workstation desk monitor screen.
 * 
 * @param {number} playerIndex - Index of player desk (0-5)
 * @param {number} [consoleCount=6] - Total number of console desks
 * @param {number} [radius=7.5] - Radial distance of desks from room center
 * @returns {Object} Transform data containing position [x, y, z] and rotation [rotX, rotY, rotZ]
 */
export function getDeskScreenTransform(playerIndex = 0, consoleCount = 6, radius = 7.5) {
  const validIdx = Math.max(0, Math.min(consoleCount - 1, playerIndex || 0));
  const angle = (validIdx / consoleCount) * Math.PI * 2 + Math.PI / 6;
  const deskX = Math.cos(angle) * radius;
  const deskZ = Math.sin(angle) * radius;
  const rotY = Math.atan2(deskX, deskZ);
  const rotX = -Math.PI / 16;
  const rotZ = 0;

  // Screen center position in 3D world space
  const localOffsetZ = 0.056;
  const x = deskX + localOffsetZ * Math.sin(rotY);
  const y = 1.38;
  const z = deskZ + localOffsetZ * Math.cos(rotY);

  return {
    position: [x, y, z],
    rotation: [rotX, rotY, rotZ],
    x,
    y,
    z,
    rotX,
    rotY,
    rotZ,
    angle,
    deskX,
    deskZ,
  };
}

/**
 * ControlRoomScene Component
 * 
 * 3D Sci-Fi Command Center built with Three.js.
 * Renders ALL GAME PHASES (Questions, Discussion, Voting, Victory) directly on the 3D PC Computer Monitors!
 * Features ultra-high-contrast screen graphics and sleek workstation 3D geometry!
 */
export function ControlRoomScene({
  gameState,
  currentPhase = 'lobby',
  activePlayerIndex = 0,
  onSelectOption,
  onConfirmAnswer,
  onProceedToVote,
  onCastVote,
  onProceedToResolution,
  onRematch,
  onReturnToLobby,
}) {
  const containerRef = useRef(null);

  // --- LIVE 3D CAMERA CALIBRATION PIPELINE DEFAULT VALUES (BALANCED 3D DESK MONITOR VIEW) ---
  const [showCalibration, setShowCalibration] = useState(false);
  const [camDist, setCamDist] = useState(1.38); // Perfect framing: monitor fills ~70% screen height in center
  const [camHeight, setCamHeight] = useState(1.85);
  const [camLookOffset, setCamLookOffset] = useState(0.85);
  const [camFov, setCamFov] = useState(52);

  // Store mutable refs for animation loop & interaction state
  const sceneStateRef = useRef({
    currentPhase,
    activePlayerIndex,
    gameState,
    onSelectOption,
    onConfirmAnswer,
    onProceedToVote,
    onCastVote,
    onProceedToResolution,
    onRematch,
    onReturnToLobby,
    hoveredOptionIdx: null,
    hoveredLockIn: false,
    hoveredVoteIdx: null,
    camDist: 1.38,
    camHeight: 1.85,
    camLookOffset: 0.85,
    camFov: 52,
  });

  // Keep refs synchronized with state & props
  useEffect(() => {
    sceneStateRef.current.currentPhase = currentPhase;
    sceneStateRef.current.activePlayerIndex = activePlayerIndex;
    sceneStateRef.current.gameState = gameState;
    sceneStateRef.current.onSelectOption = onSelectOption;
    sceneStateRef.current.onConfirmAnswer = onConfirmAnswer;
    sceneStateRef.current.onProceedToVote = onProceedToVote;
    sceneStateRef.current.onCastVote = onCastVote;
    sceneStateRef.current.onProceedToResolution = onProceedToResolution;
    sceneStateRef.current.onRematch = onRematch;
    sceneStateRef.current.onReturnToLobby = onReturnToLobby;
    sceneStateRef.current.camDist = camDist;
    sceneStateRef.current.camHeight = camHeight;
    sceneStateRef.current.camLookOffset = camLookOffset;
    sceneStateRef.current.camFov = camFov;
  }, [currentPhase, activePlayerIndex, gameState, onSelectOption, onConfirmAnswer, onProceedToVote, onCastVote, onProceedToResolution, onRematch, onReturnToLobby, camDist, camHeight, camLookOffset, camFov]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. SCENE, CAMERA & RENDERER SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711);
    scene.fog = new THREE.FogExp2(0x040711, 0.03);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 10, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Clean container & attach canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // --- 2. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    // Central Cyan Hologram Light
    const holoLightCyan = new THREE.PointLight(0x00f3ff, 4.5, 22);
    holoLightCyan.position.set(0, 3, 0);
    scene.add(holoLightCyan);

    // Central Amber Accent Light
    const holoLightAmber = new THREE.PointLight(0xff9900, 3, 20);
    holoLightAmber.position.set(0, 1, 0);
    scene.add(holoLightAmber);

    // Dynamic Phase Warning Light (Overhead Red/Amber)
    const overheadLight = new THREE.PointLight(0xff0055, 0, 30);
    overheadLight.position.set(0, 12, 0);
    scene.add(overheadLight);

    // --- 3. ANIMATED GLOWING GRID FLOOR ---
    const floorGroup = new THREE.Group();

    // Dark metallic base floor plane
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.2,
      metalness: 0.85,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    floorGroup.add(floorMesh);

    // Cyan Grid Helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x00f3ff, 0x0d3856);
    gridHelper.position.y = 0;
    floorGroup.add(gridHelper);

    // Concentric glowing ring floor markers
    const ringGeo1 = new THREE.RingGeometry(7.2, 7.42, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = -Math.PI / 2;
    ringMesh1.position.y = 0.01;
    floorGroup.add(ringMesh1);

    const ringGeo2 = new THREE.RingGeometry(2.4, 2.58, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = -Math.PI / 2;
    ringMesh2.position.y = 0.01;
    floorGroup.add(ringMesh2);

    scene.add(floorGroup);

    // --- 4. CENTRAL 3D HOLOGRAPHIC CYLINDER & PROJECTOR ---
    const holoGroup = new THREE.Group();

    // Base Projector Pod
    const podBaseGeo = new THREE.CylinderGeometry(2.2, 2.6, 0.5, 32);
    const podBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3,
    });
    const podBase = new THREE.Mesh(podBaseGeo, podBaseMat);
    podBase.position.y = 0.25;
    holoGroup.add(podBase);

    // Glowing emitter ring inside base
    const emitterRingGeo = new THREE.TorusGeometry(2.0, 0.08, 16, 64);
    const emitterRingMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const emitterRing = new THREE.Mesh(emitterRingGeo, emitterRingMat);
    emitterRing.rotation.x = Math.PI / 2;
    emitterRing.position.y = 0.51;
    holoGroup.add(emitterRing);

    // Semi-transparent Outer Hologram Cylinder
    const holoCylGeo = new THREE.CylinderGeometry(1.8, 1.8, 5, 32, 1, true);
    const holoCylMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    });
    const holoCyl = new THREE.Mesh(holoCylGeo, holoCylMat);
    holoCyl.position.y = 3.0;
    holoGroup.add(holoCyl);

    // Inner Sci-Fi Rotating Holographic Geometry
    const holoCoreGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const holoCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const holoCore = new THREE.Mesh(holoCoreGeo, holoCoreMat);
    holoCore.position.y = 3.0;
    holoGroup.add(holoCore);

    // Outer rotating ring around core
    const coreRingGeo = new THREE.TorusGeometry(1.4, 0.04, 16, 64);
    const coreRingMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.85 });
    const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
    coreRing.position.y = 3.0;
    holoGroup.add(coreRing);

    // Holographic Particle Cloud
    const holoParticleCount = 220;
    const holoParticleGeo = new THREE.BufferGeometry();
    const holoPositions = new Float32Array(holoParticleCount * 3);
    const holoSpeeds = new Float32Array(holoParticleCount);

    for (let i = 0; i < holoParticleCount; i++) {
      const radius = Math.random() * 1.6;
      const angle = Math.random() * Math.PI * 2;
      holoPositions[i * 3] = Math.cos(angle) * radius;
      holoPositions[i * 3 + 1] = Math.random() * 5.0 + 0.5;
      holoPositions[i * 3 + 2] = Math.sin(angle) * radius;
      holoSpeeds[i] = 0.015 + Math.random() * 0.025;
    }

    holoParticleGeo.setAttribute('position', new THREE.BufferAttribute(holoPositions, 3));
    const holoParticleMat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const holoParticles = new THREE.Points(holoParticleGeo, holoParticleMat);
    holoGroup.add(holoParticles);

    scene.add(holoGroup);

    // --- 5. 6 SCI-FI WORKSTATION PODS WITH HIGH-CONTRAST 3D COMPUTER MONITORS ---
    const consoleCount = 6;
    const consoleRadius = 7.5;
    const consoleGroup = new THREE.Group();
    const consoleStatusRings = [];
    const consoleLightMeshList = [];
    const consoleBezelMaterials = [];

    const screenCanvasList = [];
    const screenTextureList = [];
    const screenMeshList = [];

    // Redesigned Futuristic Sci-Fi Desk Surface
    const deskGeo = new THREE.BoxGeometry(2.5, 0.85, 1.4);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Sleek Dark Metallic Monitor Backing Frame (NO WIREFRAME CROSS X OVERLAY)
    const bezelBackingGeo = new THREE.BoxGeometry(2.46, 1.56, 0.05);
    const bezelBackingMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.2,
      metalness: 0.9,
    });

    const screenGeo = new THREE.PlaneGeometry(2.4, 1.5);
    const ringStatusGeo = new THREE.TorusGeometry(1.5, 0.06, 16, 32);

    for (let i = 0; i < consoleCount; i++) {
      const transform = getDeskScreenTransform(i, consoleCount, consoleRadius);
      const { deskX, deskZ } = transform;

      const pDeskGroup = new THREE.Group();
      pDeskGroup.position.set(deskX, 0, deskZ);

      // Main Workstation Desk Body
      const deskMesh = new THREE.Mesh(deskGeo, deskMat);
      deskMesh.position.set(0, 0.425, 0);
      pDeskGroup.add(deskMesh);

      // Glowing Under-Desk LED Strip Trim
      const ledTrimGeo = new THREE.BoxGeometry(2.52, 0.04, 1.42);
      const ledTrimMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
      const ledTrimMesh = new THREE.Mesh(ledTrimGeo, ledTrimMat);
      ledTrimMesh.position.set(0, 0.84, 0);
      pDeskGroup.add(ledTrimMesh);

      // Sci-Fi Cyberpunk Keyboard Mesh on Desk Surface
      const kbGeo = new THREE.BoxGeometry(0.8, 0.03, 0.3);
      const kbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.6 });
      const kbMesh = new THREE.Mesh(kbGeo, kbMat);
      kbMesh.position.set(0, 0.865, 0.35);
      pDeskGroup.add(kbMesh);

      // Monitor Heavy Duty Dual Stand
      const standGeo = new THREE.CylinderGeometry(0.09, 0.14, 0.45, 16);
      const standMesh = new THREE.Mesh(standGeo, deskMat);
      standMesh.position.set(0, 0.65, 0.08);
      pDeskGroup.add(standMesh);

      // Sleek Metallic Bezel Backing Plane (NO WIREFRAME CROSS X OVERLAY)
      const bezelBackingMesh = new THREE.Mesh(bezelBackingGeo, bezelBackingMat);
      bezelBackingMesh.position.set(0, 1.68, 0.03);
      bezelBackingMesh.rotation.x = -Math.PI / 16;
      pDeskGroup.add(bezelBackingMesh);

      // Outer Glowing LED Bezel Border Trim
      const bezelEdgeGeo = new THREE.BoxGeometry(2.48, 1.58, 0.02);
      const bezelEdgeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.8 });
      const bezelEdgeMesh = new THREE.Mesh(bezelEdgeGeo, bezelEdgeMat);
      bezelEdgeMesh.position.set(0, 1.68, 0.04);
      bezelEdgeMesh.rotation.x = -Math.PI / 16;
      pDeskGroup.add(bezelEdgeMesh);
      consoleBezelMaterials.push(bezelEdgeMat);

      // High-Definition HTML5 Canvas Texture for 3D PC Monitor Screen (1280 x 800)
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 800;
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      screenCanvasList.push(canvas);
      screenTextureList.push(texture);

      const screenMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: false,
        side: THREE.DoubleSide,
      });

      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 1.68, 0.056);
      screenMesh.rotation.x = -Math.PI / 16;
      screenMesh.userData = { playerIndex: i };
      pDeskGroup.add(screenMesh);
      screenMeshList.push(screenMesh);

      // Console status ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringStatusGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, 0.01, 0);
      pDeskGroup.add(ringMesh);

      // Point light per console
      const cLight = new THREE.PointLight(0x00f3ff, 0.9, 4);
      cLight.position.set(0, 2.4, 0.5);
      pDeskGroup.add(cLight);

      pDeskGroup.lookAt(deskX * 2, 0, deskZ * 2);

      consoleGroup.add(pDeskGroup);
      consoleStatusRings.push(ringMat);
      consoleLightMeshList.push(cLight);
    }
    scene.add(consoleGroup);

    // --- 6. AMBIENT STARFIELD / CYBER DUST PARTICLE FIELD ---
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 50;
      starPositions[i * 3 + 1] = Math.random() * 25;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.08,
      transparent: true,
      opacity: 0.4,
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    scene.add(starParticles);

    // --- 7. HELPER TO DRAW ALL GAME PHASES WITH MASSIVE CHONKY HIGH-CONTRAST TYPOGRAPHY ---
    const update3DScreenTextures = (state, phase, activeIdx) => {
      try {
        const players = state?.players || [];
        const questionObj = state?.currentQuestion || state?.question;
        const { hoveredOptionIdx, hoveredLockIn, hoveredVoteIdx } = sceneStateRef.current;

        // Robust Question Text Extraction
        const rawQ = questionObj?.question || questionObj?.text || questionObj?.prompt || questionObj?.title || questionObj;
        let qText = 'Who in this group is the biggest hypochondriac?';
        if (rawQ) {
          if (typeof rawQ === 'string') qText = rawQ;
          else if (rawQ.question) qText = String(rawQ.question);
          else if (rawQ.text) qText = String(rawQ.text);
        }

        let rawOptions = [];
        if (questionObj && Array.isArray(questionObj.options) && questionObj.options.length > 0) {
          rawOptions = questionObj.options;
        } else if (state && Array.isArray(state.options) && state.options.length > 0) {
          rawOptions = state.options;
        }

        if (!rawOptions || rawOptions.length === 0) {
          rawOptions = [
            'A) Twice a day — Hyper clean',
            'B) Once a day like normal',
            'C) Every 2-3 days unless I sweat',
            'D) Once a week',
          ];
        }

        screenCanvasList.forEach((canvas, idx) => {
          const ctx = canvas.getContext('2d');
          const texture = screenTextureList[idx];
          const player = players[idx];
          const isSpy = idx === state?.spyIndex;
          const isActiveDesk = idx === activeIdx;

          // Clear Screen & Dark Solid Metallic Obsidian Background (#020612)
          ctx.fillStyle = '#020612';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid scanline texture
          ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
          for (let y = 0; y < canvas.height; y += 8) {
            ctx.fillRect(0, y, canvas.width, 4);
          }

          // Border Frame
          ctx.strokeStyle = isSpy && phase === 'question' ? '#ff0055' : isActiveDesk ? '#00ffff' : '#0d4a75';
          ctx.lineWidth = 14;
          ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);

          // Inner Solid Cyan Accent Border
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 3;
          ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

          // If this is another player's workstation in the 3D room (Station 02, 03, etc.)
          if (!isActiveDesk) {
            // RENDER DEDICATED STATION STATUS FOR OTHER OPERATIVES IN ROOM
            ctx.fillStyle = '#081a2e';
            ctx.fillRect(24, 24, canvas.width - 48, 70);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(24, 24, canvas.width - 48, 70);

            ctx.font = 'bold 28px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#00ffff';
            const otherName = player?.name ? String(player.name).toUpperCase() : `AGENT 0${idx + 1}`;
            ctx.fillText(`STATION 0${idx + 1} // OPERATIVE: ${otherName}`, 48, 68);

            // Center Status Card
            ctx.fillStyle = '#0a1a30';
            ctx.fillRect(100, 160, 1080, 520);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(100, 160, 1080, 520);

            ctx.fillStyle = '#00ffaa';
            ctx.fillRect(140, 220, 1000, 80);
            ctx.font = 'bold 36px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#020617';
            ctx.textAlign = 'center';
            ctx.fillText('✔ STATION STATUS: ONLINE & LINKED', 640, 274);

            ctx.font = 'bold 32px "Rajdhani", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`OPERATIVE CONSOLE 0${idx + 1} — ACTIVE IN SESSION`, 640, 380);

            ctx.fillStyle = '#00ffff';
            ctx.fillRect(240, 440, 800, 90);
            ctx.font = 'bold 32px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#020617';
            ctx.fillText('📡 ENCRYPTED CHANNEL SECURED', 640, 496);
            ctx.textAlign = 'left';

            texture.needsUpdate = true;
            return;
          }

          // --- TOP MONITOR HEADER BAR FOR ACTIVE PLAYER ---
          ctx.fillStyle = isSpy && phase === 'question' ? '#3b071e' : '#081a2e';
          ctx.fillRect(24, 24, canvas.width - 48, 70);
          ctx.strokeStyle = isSpy && phase === 'question' ? '#ff0055' : '#00ffff';
          ctx.lineWidth = 3;
          ctx.strokeRect(24, 24, canvas.width - 48, 70);

          ctx.font = 'bold 26px "Orbitron", "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = isSpy && phase === 'question' ? '#ff0055' : '#00ffff';
          const pNameStr = player?.name ? String(player.name).toUpperCase() : `AGENT 0${idx + 1}`;
          ctx.fillText(`STATION 0${idx + 1} // OPERATIVE: ${pNameStr}`, 44, 68);

          // System Clock / Timer Top Right
          ctx.font = 'bold 24px "Orbitron", "Segoe UI", Arial, sans-serif';
          const sysTimeStr = new Date().toTimeString().split(' ')[0];
          ctx.fillStyle = isSpy && phase === 'question' ? '#ff0055' : '#00ffaa';
          ctx.fillText(`SYS: ${sysTimeStr}`, canvas.width - 260, 68);

          // --- GAME PHASE SWITCH DRAWING FOR ACTIVE PLAYER ---
          if (phase === 'discussion') {
            // PHASE 2: DISCUSSION ON 3D SCREEN
            ctx.fillStyle = '#0f2b48';
            ctx.fillRect(40, 104, 1200, 48);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(40, 104, 1200, 48);

            ctx.font = 'bold 22px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#00ffff';
            ctx.fillText('📡 INTEL DEBRIEFING MATRIX // ANALYZE ANSWERS & DISCUSS SUSPECTS', 56, 137);

            ctx.fillStyle = '#071629';
            ctx.fillRect(40, 165, 1200, 75);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(40, 165, 1200, 75);

            ctx.font = 'bold 16px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffcc00';
            ctx.fillText('QUESTION PROMPT >', 56, 192);

            ctx.font = 'bold 24px "Rajdhani", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(qText, 56, 224);

            const playerAnswers = state?.playerAnswers || {};
            players.forEach((p, pIdx) => {
              const col = pIdx % 2;
              const row = Math.floor(pIdx / 2);
              const bx = 40 + col * 610;
              const by = 250 + row * 118;
              const bw = 590;
              const bh = 104;

              const ansVal = playerAnswers[pIdx];
              const ansText = typeof ansVal === 'number' ? rawOptions[ansVal] : (ansVal || 'SUBMITTED ANSWER');

              ctx.fillStyle = '#091c33';
              ctx.fillRect(bx, by, bw, bh);
              ctx.strokeStyle = '#00ffff';
              ctx.lineWidth = 3;
              ctx.strokeRect(bx, by, bw, bh);

              ctx.fillStyle = '#00ffff';
              ctx.font = 'bold 22px "Orbitron", "Segoe UI", Arial, sans-serif';
              ctx.fillText(`${p.name || `AGENT 0${pIdx + 1}`}`, bx + 18, by + 38);

              ctx.fillStyle = '#ffeb3b';
              ctx.font = 'bold 22px "Rajdhani", "Segoe UI", Arial, sans-serif';
              const ansStr = String(typeof ansText === 'string' ? ansText : (ansText?.text || ansText?.label || 'Choice'));
              ctx.fillText(`ANSWER: ${ansStr}`, bx + 18, by + 76);
            });

            const btnX = 400;
            const btnY = 625;
            const btnW = 480;
            const btnH = 130;
            const isBtnHovered = isActiveDesk && hoveredLockIn;

            ctx.fillStyle = isBtnHovered ? '#00ffff' : '#0c3a66';
            ctx.fillRect(btnX, btnY, btnW, btnH);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 5;
            ctx.strokeRect(btnX, btnY, btnW, btnH);

            ctx.font = 'bold 26px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = isBtnHovered ? '#020617' : '#ffcc00';
            ctx.textAlign = 'center';
            ctx.fillText('🗳️ PROCEED TO SECURITY VOTE', btnX + btnW / 2, btnY + 58);

            ctx.font = 'bold 18px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = isBtnHovered ? '#020617' : '#ffffff';
            ctx.fillText('[CLICK OR PRESS ENTER]', btnX + btnW / 2, btnY + 96);
            ctx.textAlign = 'left';

          } else if (phase === 'voting') {
            // PHASE 3: VOTING ON 3D SCREEN
            ctx.fillStyle = '#422204';
            ctx.fillRect(40, 104, 1200, 48);
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 3;
            ctx.strokeRect(40, 104, 1200, 48);

            ctx.font = 'bold 20px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffaa00';
            ctx.fillText('⚠️ SECURITY ACCUSATION MATRIX // SELECT SUSPECTED INTRUDER TO EJECT', 56, 137);

            const playerVotes = state?.playerVotes || {};
            const myVote = playerVotes[idx];

            players.forEach((p, pIdx) => {
              const col = pIdx % 3;
              const row = Math.floor(pIdx / 3);
              const bx = 40 + col * 405;
              const by = 165 + row * 220;
              const bw = 390;
              const bh = 200;

              const isSelectedTarget = myVote === pIdx;
              const isHoveredTarget = isActiveDesk && hoveredVoteIdx === pIdx;

              ctx.fillStyle = isSelectedTarget
                ? '#660b24'
                : isHoveredTarget
                ? '#523009'
                : '#091c33';
              ctx.fillRect(bx, by, bw, bh);

              ctx.strokeStyle = isSelectedTarget ? '#ff0055' : isHoveredTarget ? '#ffaa00' : '#00ffff';
              ctx.lineWidth = isSelectedTarget || isHoveredTarget ? 5 : 3;
              ctx.strokeRect(bx, by, bw, bh);

              ctx.fillStyle = isSelectedTarget ? '#ff0055' : '#00ffff';
              ctx.font = 'bold 24px "Orbitron", "Segoe UI", Arial, sans-serif';
              ctx.fillText(`${p.name || `AGENT 0${pIdx + 1}`}`, bx + 20, by + 50);

              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 20px "Rajdhani", "Segoe UI", Arial, sans-serif';
              ctx.fillText(`STATION: 0${pIdx + 1}`, bx + 20, by + 90);

              if (pIdx === idx) {
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(bx + 20, by + 118, 160, 36);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px "Orbitron", "Segoe UI", Arial, sans-serif';
                ctx.fillText('YOUR WORKSTATION', bx + 28, by + 141);
              }

              if (isSelectedTarget) {
                ctx.fillStyle = '#ff0055';
                ctx.fillRect(bx + bw - 145, by + 16, 130, 38);
                ctx.font = 'bold 15px "Orbitron", "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('ACCUSED 🎯', bx + bw - 134, by + 41);
              }
            });

            const btnX = 400;
            const btnY = 625;
            const btnW = 480;
            const btnH = 130;
            const isBtnHovered = isActiveDesk && hoveredLockIn;
            const hasVoted = myVote !== undefined;

            ctx.fillStyle = hasVoted ? '#10b981' : isBtnHovered ? '#ffaa00' : '#422204';
            ctx.fillRect(btnX, btnY, btnW, btnH);
            ctx.strokeStyle = hasVoted ? '#10b981' : '#ffaa00';
            ctx.lineWidth = 5;
            ctx.strokeRect(btnX, btnY, btnW, btnH);

            ctx.font = 'bold 26px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = hasVoted || isBtnHovered ? '#ffffff' : '#ffaa00';
            ctx.textAlign = 'center';
            ctx.fillText(hasVoted ? '✔ VOTE TRANSMITTED' : '🚨 CAST VOTE TO EJECT', btnX + btnW / 2, btnY + 58);

            ctx.font = 'bold 18px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(hasVoted ? 'VOTE LOCKED IN' : '[CLICK OR PRESS ENTER]', btnX + btnW / 2, btnY + 96);
            ctx.textAlign = 'left';

          } else if (phase === 'victory') {
            // PHASE 4: VICTORY ON 3D SCREEN
            const winner = state?.winner;
            const isAgentsWon = winner === 'agents';

            ctx.fillStyle = isAgentsWon ? '#084d31' : '#570a20';
            ctx.fillRect(40, 100, 1200, 145);
            ctx.strokeStyle = isAgentsWon ? '#00ffaa' : '#ff0055';
            ctx.lineWidth = 5;
            ctx.strokeRect(40, 100, 1200, 145);

            ctx.font = 'bold 38px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = isAgentsWon ? '#00ffaa' : '#ff0055';
            ctx.fillText(isAgentsWon ? '🛡️ AGENTS VICTORIOUS — INTRUDER NEUTRALIZED!' : '⚠️ INTRUDER WINS — DEFENSES BREACHED!', 64, 168);

            ctx.font = 'bold 24px "Rajdhani", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            const spyPlayer = players[state?.spyIndex];
            const spyNameStr = spyPlayer?.name || `Agent 0${(state?.spyIndex || 0) + 1}`;
            ctx.fillText(`THE INTRUDER WAS: ${spyNameStr.toUpperCase()}`, 64, 218);

            const btn1X = 240;
            const btn1Y = 450;
            const btn1W = 360;
            const btn1H = 120;

            ctx.fillStyle = '#0c3a66';
            ctx.fillRect(btn1X, btn1Y, btn1W, btn1H);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(btn1X, btn1Y, btn1W, btn1H);

            ctx.font = 'bold 26px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#00ffff';
            ctx.textAlign = 'center';
            ctx.fillText('🔄 PLAY AGAIN', btn1X + btn1W / 2, btn1Y + 70);

            const btn2X = 680;
            const btn2Y = 450;
            const btn2W = 360;
            const btn2H = 120;

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(btn2X, btn2Y, btn2W, btn2H);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(btn2X, btn2Y, btn2W, btn2H);

            ctx.font = 'bold 26px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('🏠 RETURN TO LOBBY', btn2X + btn2W / 2, btn2Y + 70);
            ctx.textAlign = 'left';

          } else {
            // PHASE 1: QUESTION PHASE ON 3D SCREEN
            const badgeY = 104;
            if (!isSpy) {
              ctx.fillStyle = '#0a324d';
              ctx.fillRect(40, badgeY, 660, 48);
              ctx.strokeStyle = '#00ffff';
              ctx.lineWidth = 3;
              ctx.strokeRect(40, badgeY, 660, 48);

              ctx.font = 'bold 20px "Orbitron", "Segoe UI", Arial, sans-serif';
              ctx.fillStyle = '#00ffff';
              ctx.fillText('🛡️ AGENT - SECURITY QUESTION ASSIGNED', 58, badgeY + 33);
            } else {
              ctx.fillStyle = '#570a20';
              ctx.fillRect(40, badgeY, 780, 48);
              ctx.strokeStyle = '#ff0055';
              ctx.lineWidth = 3;
              ctx.strokeRect(40, badgeY, 780, 48);

              ctx.font = 'bold 20px "Orbitron", "Segoe UI", Arial, sans-serif';
              ctx.fillStyle = '#ff0055';
              ctx.fillText('⚠️ INTRUDER ALERT - QUESTION CLASSIFIED! INFER FROM CHOICES', 58, badgeY + 33);
            }

            // Question Prompt Box (Solid Dark Obsidian #071526 with Bold White Prompt Text)
            const qBoxY = 168;
            const qBoxH = 135;
            ctx.fillStyle = isSpy ? '#33081a' : '#071526';
            ctx.fillRect(40, qBoxY, 1200, qBoxH);
            ctx.strokeStyle = isSpy ? '#ff0055' : '#00ffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(40, qBoxY, 1200, qBoxH);

            ctx.fillStyle = isSpy ? '#ff0055' : '#00ffff';
            ctx.fillRect(40, qBoxY, 14, qBoxH);

            ctx.font = 'bold 18px "Orbitron", "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = isSpy ? '#ff0055' : '#ffcc00';
            ctx.fillText('OPERATIVE_PROMPT >', 68, qBoxY + 34);

            if (isSpy) {
              ctx.fillStyle = '#ff0055';
              ctx.font = 'bold 26px "Orbitron", "Segoe UI", Arial, sans-serif';
              ctx.fillText('🔒 WARNING: SECURITY PROMPT ENCRYPTED', 68, qBoxY + 74);

              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 22px "Rajdhani", "Segoe UI", Arial, sans-serif';
              ctx.fillText('Decryption key absent. Deducing prompt from operative choices below.', 68, qBoxY + 110);
            } else {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 30px "Rajdhani", "Segoe UI", Arial, sans-serif';

              const safeQText = String(qText || '');
              const words = safeQText.split(' ');
              let line = '';
              let yPos = qBoxY + 76;
              for (let w of words) {
                const testLine = line + w + ' ';
                if (ctx.measureText(testLine).width > 1120) {
                  ctx.fillText(line, 68, yPos);
                  line = w + ' ';
                  yPos += 36;
                } else {
                  line = testLine;
                }
              }
              ctx.fillText(line, 68, yPos);
            }

            // 4 Interactive Option Boxes (A, B, C, D) — Solid Ultra-High Contrast Arcade Cards
            const optBoxes = [
              { x: 40, y: 318, w: 585, h: 145, label: 'A' },
              { x: 655, y: 318, w: 585, h: 145, label: 'B' },
              { x: 40, y: 475, w: 585, h: 145, label: 'C' },
              { x: 655, y: 475, w: 585, h: 145, label: 'D' },
            ];

            rawOptions.slice(0, 4).forEach((optTextRaw, oIdx) => {
              const box = optBoxes[oIdx];
              const optString = String(typeof optTextRaw === 'string' ? optTextRaw : (optTextRaw?.text || optTextRaw?.label || ''));
              const playerAns = state?.playerAnswers?.[idx];
              const isSelected = playerAns === optString || playerAns === oIdx || playerAns === box.label;
              const isHovered = isActiveDesk && hoveredOptionIdx === oIdx;

              ctx.fillStyle = isSelected
                ? '#00ffff'
                : isHovered
                ? '#134074'
                : '#0b2545';
              ctx.fillRect(box.x, box.y, box.w, box.h);

              ctx.strokeStyle = isSelected ? '#ffffff' : isHovered ? '#ffffff' : '#00ffff';
              ctx.lineWidth = isSelected ? 6 : isHovered ? 5 : 4;
              ctx.strokeRect(box.x, box.y, box.w, box.h);

              // Massive Solid Key Badge Box [A] [B] [C] [D]
              ctx.fillStyle = isSelected ? '#020617' : '#00ffff';
              ctx.fillRect(box.x + 14, box.y + 14, 64, 64);
              ctx.strokeStyle = isSelected ? '#00ffff' : '#020617';
              ctx.lineWidth = 3;
              ctx.strokeRect(box.x + 14, box.y + 14, 64, 64);

              ctx.font = 'bold 38px Arial, sans-serif';
              ctx.fillStyle = isSelected ? '#00ffff' : '#020617';
              ctx.fillText(box.label, box.x + 32, box.y + 60);

              ctx.font = 'bold 15px Arial, sans-serif';
              ctx.fillStyle = isSelected ? '#020617' : '#00ffff';
              ctx.fillText(`KEY [${box.label}]`, box.x + 16, box.y + 104);

              // Massive Chonky White Option Text (28px Arial)
              ctx.font = 'bold 28px Arial, sans-serif';
              ctx.fillStyle = isSelected ? '#020617' : '#ffffff';

              const optWords = optString.split(' ');
              let optLine = '';
              let optY = box.y + 50;
              for (let w of optWords) {
                const testLine = optLine + w + ' ';
                if (ctx.measureText(testLine).width > box.w - 115) {
                  ctx.fillText(optLine, box.x + 94, optY);
                  optLine = w + ' ';
                  optY += 34;
                } else {
                  optLine = testLine;
                }
              }
              ctx.fillText(optLine, box.x + 94, optY);

              if (isSelected) {
                ctx.fillStyle = '#020617';
                ctx.fillRect(box.x + box.w - 152, box.y + 14, 138, 42);
                ctx.font = 'bold 16px Arial, sans-serif';
                ctx.fillStyle = '#00ffff';
                ctx.fillText('SELECTED ✓', box.x + box.w - 140, box.y + 41);
              }
            });

            // Lock-In Answer Button (Massive Solid High-Contrast Button)
            const btnX = 360;
            const btnY = 635;
            const btnW = 560;
            const btnH = 130;

            const playerAns = state?.playerAnswers?.[idx];
            const isConfirmed = state?.isAnswerConfirmed || Boolean(playerAns);
            const isBtnHovered = isActiveDesk && hoveredLockIn && !isConfirmed;

            ctx.fillStyle = isConfirmed
              ? '#10b981'
              : isBtnHovered
              ? '#ffffff'
              : playerAns !== undefined
              ? '#00ffff'
              : '#0b3558';
            ctx.fillRect(btnX, btnY, btnW, btnH);

            ctx.strokeStyle = isConfirmed ? '#10b981' : '#00ffff';
            ctx.lineWidth = 5;
            ctx.strokeRect(btnX, btnY, btnW, btnH);

            ctx.font = 'bold 30px Arial, sans-serif';
            ctx.fillStyle = isConfirmed ? '#ffffff' : isBtnHovered ? '#020617' : playerAns !== undefined ? '#020617' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(isConfirmed ? '✔ ANSWER TRANSMITTED' : '🔒 LOCK-IN ANSWER', btnX + btnW / 2, btnY + 58);

            ctx.font = 'bold 18px Arial, sans-serif';
            ctx.fillStyle = isConfirmed ? '#ffffff' : isBtnHovered ? '#020617' : playerAns !== undefined ? '#020617' : '#ffffff';
            ctx.fillText(isConfirmed ? 'CHOICE LOCKED IN' : '[CLICK OR PRESS ENTER]', btnX + btnW / 2, btnY + 98);
            ctx.textAlign = 'left';
          }

          texture.needsUpdate = true;
        });
      } catch (err) {
        console.error('Error updating 3D screen textures:', err);
      }
    };

    // --- 8. THREE.JS RAYCASTER & CLICK LISTENER FOR 3D VIRTUAL COMPUTER MONITORS ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const { currentPhase: phase, activePlayerIndex: activeIdx } = sceneStateRef.current;
      const activeScreen = screenMeshList[activeIdx];
      if (!activeScreen) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(activeScreen);

      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv;
        const px = uv.x * 1280;
        const py = (1 - uv.y) * 800;

        let foundHoverOption = null;
        let foundHoverLockIn = false;
        let foundHoverVote = null;

        if (phase === 'question') {
          if (px >= 400 && px <= 880 && py >= 635 && py <= 760) foundHoverLockIn = true;
          const optBoxes = [
            { x: 40, y: 318, w: 585, h: 145, idx: 0 },
            { x: 655, y: 318, w: 585, h: 145, idx: 1 },
            { x: 40, y: 475, w: 585, h: 145, idx: 2 },
            { x: 655, y: 475, w: 585, h: 145, idx: 3 },
          ];
          optBoxes.forEach(b => {
            if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) foundHoverOption = b.idx;
          });
        } else if (phase === 'discussion') {
          if (px >= 400 && px <= 880 && py >= 625 && py <= 755) foundHoverLockIn = true;
        } else if (phase === 'voting') {
          if (px >= 400 && px <= 880 && py >= 625 && py <= 755) foundHoverLockIn = true;
          for (let pIdx = 0; pIdx < 6; pIdx++) {
            const col = pIdx % 3;
            const row = Math.floor(pIdx / 3);
            const bx = 40 + col * 405;
            const by = 165 + row * 220;
            if (px >= bx && px <= bx + 390 && py >= by && py <= by + 200) foundHoverVote = pIdx;
          }
        }

        sceneStateRef.current.hoveredOptionIdx = foundHoverOption;
        sceneStateRef.current.hoveredLockIn = foundHoverLockIn;
        sceneStateRef.current.hoveredVoteIdx = foundHoverVote;

        if (foundHoverOption !== null || foundHoverLockIn || foundHoverVote !== null) {
          renderer.domElement.style.cursor = 'pointer';
        } else {
          renderer.domElement.style.cursor = 'default';
        }
      } else {
        sceneStateRef.current.hoveredOptionIdx = null;
        sceneStateRef.current.hoveredLockIn = false;
        sceneStateRef.current.hoveredVoteIdx = null;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handlePointerDown = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const {
        currentPhase: phase,
        activePlayerIndex: activeIdx,
        onSelectOption: selectCb,
        onConfirmAnswer: confirmCb,
        onProceedToVote: proceedVoteCb,
        onCastVote: castVoteCb,
        onProceedToResolution: resolveCb,
        onRematch: rematchCb,
        onReturnToLobby: lobbyCb,
      } = sceneStateRef.current;

      const activeScreen = screenMeshList[activeIdx];
      if (!activeScreen) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(activeScreen);

      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv;
        const px = uv.x * 1280;
        const py = (1 - uv.y) * 800;

        if (phase === 'question') {
          if (px >= 400 && px <= 880 && py >= 635 && py <= 760) {
            playVoteCast();
            confirmCb?.();
            return;
          }
          const optBoxes = [
            { x: 40, y: 318, w: 585, h: 145, idx: 0 },
            { x: 655, y: 318, w: 585, h: 145, idx: 1 },
            { x: 40, y: 475, w: 585, h: 145, idx: 2 },
            { x: 655, y: 475, w: 585, h: 145, idx: 3 },
          ];
          optBoxes.forEach(b => {
            if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
              playLaserLock();
              selectCb?.(b.idx);
            }
          });
        } else if (phase === 'discussion') {
          if (px >= 400 && px <= 880 && py >= 625 && py <= 755) {
            playTerminalPowerOn();
            proceedVoteCb?.();
          }
        } else if (phase === 'voting') {
          if (px >= 400 && px <= 880 && py >= 625 && py <= 755) {
            playTerminalPowerOn();
            resolveCb?.();
            return;
          }
          for (let pIdx = 0; pIdx < 6; pIdx++) {
            const col = pIdx % 3;
            const row = Math.floor(pIdx / 3);
            const bx = 40 + col * 405;
            const by = 165 + row * 220;
            if (px >= bx && px <= bx + 390 && py >= by && py <= by + 200) {
              playLaserLock();
              castVoteCb?.(pIdx);
            }
          }
        } else if (phase === 'victory') {
          if (px >= 240 && px <= 600 && py >= 450 && py <= 570) {
            rematchCb?.();
          } else if (px >= 680 && px <= 1040 && py >= 450 && py <= 570) {
            lobbyCb?.();
          }
        }
      }
    };

    // Keyboard Hotkeys
    const handleKeyDown = (e) => {
      const {
        currentPhase: phase,
        onSelectOption: selectCb,
        onConfirmAnswer: confirmCb,
        onProceedToVote: proceedVoteCb,
        onProceedToResolution: resolveCb,
      } = sceneStateRef.current;

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      const code = e.code;
      const key = e.key ? e.key.toUpperCase() : '';

      if (phase === 'question') {
        if (code === 'KeyA' || key === 'A' || key === '1') selectCb?.(0);
        else if (code === 'KeyB' || key === 'B' || key === '2') selectCb?.(1);
        else if (code === 'KeyC' || key === 'C' || key === '3') selectCb?.(2);
        else if (code === 'KeyD' || key === 'D' || key === '4') selectCb?.(3);
        else if (code === 'Enter' || code === 'Space' || key === 'ENTER' || key === ' ') confirmCb?.();
      } else if (phase === 'discussion') {
        if (code === 'Enter' || code === 'Space') proceedVoteCb?.();
      } else if (phase === 'voting') {
        if (code === 'Enter' || code === 'Space') resolveCb?.();
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    // --- 9. ANIMATION LOOP & CAMERA CHOREOGRAPHY ---
    const clock = new THREE.Clock();
    let animationFrameId;

    const cyanColor = new THREE.Color(0x00f3ff);
    const amberColor = new THREE.Color(0xff9900);
    const redColor = new THREE.Color(0xff0055);

    const targetCamPos = new THREE.Vector3(0, 10, 18);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const { currentPhase: phase, activePlayerIndex: activeIdx, gameState: state, camDist: distRatio, camHeight: hVal, camLookOffset: lookRatio, camFov: fovVal } = sceneStateRef.current;

      // Update interactive 3D PC monitor screen textures
      update3DScreenTextures(state, phase, activeIdx);

      // Rotate central hologram core and rings
      holoCore.rotation.x = elapsedTime * 0.4;
      holoCore.rotation.y = elapsedTime * 0.6;
      coreRing.rotation.z = elapsedTime * -0.5;
      coreRing.rotation.x = Math.sin(elapsedTime) * 0.3;
      holoCyl.rotation.y = elapsedTime * -0.15;

      // Animate rising holographic particles
      const posAttr = holoParticleGeo.attributes.position;
      for (let i = 0; i < holoParticleCount; i++) {
        let y = posAttr.getY(i);
        y += holoSpeeds[i];
        if (y > 5.5) y = 0.5;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Slowly rotate star dust field
      starParticles.rotation.y = elapsedTime * 0.02;

      // Dynamic Status Lights on 6 Player Consoles
      for (let i = 0; i < consoleCount; i++) {
        const ringMat = consoleStatusRings[i];
        const light = consoleLightMeshList[i];
        const bezelMat = consoleBezelMaterials[i];
        let targetColor = cyanColor;

        const player = state?.players?.[i];

        if (phase === 'voting') {
          targetColor = amberColor;
        } else if (player?.isSuspicious || player?.accused) {
          targetColor = redColor;
        } else if (i === activeIdx) {
          targetColor = phase === 'question' ? amberColor : cyanColor;
        } else if (player?.isReady || player?.hasAnswered) {
          targetColor = cyanColor;
        }

        if (i === activeIdx) {
          light.intensity = 1.5 + Math.sin(elapsedTime * 5) * 0.7;
          if (bezelMat) bezelMat.opacity = 0.8 + Math.sin(elapsedTime * 5) * 0.2;
        } else {
          light.intensity = 0.6;
          if (bezelMat) bezelMat.opacity = 0.4;
        }

        ringMat.color.lerp(targetColor, 0.08);
        if (bezelMat) bezelMat.color.lerp(targetColor, 0.08);
        light.color.copy(ringMat.color);
      }

      // Overhead room light pulse based on phase
      if (phase === 'voting' || phase === 'suspicious') {
        overheadLight.intensity = 2.0 + Math.sin(elapsedTime * 6) * 1.5;
        overheadLight.color.lerp(redColor, 0.1);
      } else {
        overheadLight.intensity = 0.3;
        overheadLight.color.lerp(amberColor, 0.05);
      }

      // Camera choreography per currentPhase
      const validActiveIdx = Math.max(0, Math.min(consoleCount - 1, activeIdx || 0));
      const activeAngle = (validActiveIdx / consoleCount) * Math.PI * 2 + Math.PI / 6;
      const activeX = Math.cos(activeAngle) * consoleRadius;
      const activeZ = Math.sin(activeAngle) * consoleRadius;

      if (phase === 'lobby') {
        const orbitTime = elapsedTime * 0.15;
        targetCamPos.set(Math.cos(orbitTime) * 16, 8.5, Math.sin(orbitTime) * 16);
        targetLookAt.set(0, 1.8, 0);
      } else {
        // Gameplay Phases (question, discussion, voting, victory) sit at 3D Desk Monitor
        targetCamPos.set(activeX * distRatio, hVal, activeZ * distRatio);
        targetLookAt.set(activeX * lookRatio, 1.45, activeZ * lookRatio);
      }

      // Smooth lerp camera movement
      camera.position.lerp(targetCamPos, 0.05);
      currentLookAt.lerp(targetLookAt, 0.05);
      camera.lookAt(currentLookAt);

      // Smoothly update Field of View (FOV)
      const targetFov = phase === 'lobby' ? 55 : fovVal;
      if (Math.abs(camera.fov - targetFov) > 0.001) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.05);
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- 10. RESIZE HANDLER ---
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- 11. CLEANUP ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointermove', handlePointerMove);
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      }
      window.removeEventListener('keydown', handleKeyDown);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'auto' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* --- LIVE 3D CAMERA CALIBRATION PIPELINE TOOL --- */}
      <div style={{
        position: 'absolute',
        top: '75px',
        right: '20px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowCalibration(!showCalibration)}
          style={{
            background: 'rgba(0, 240, 255, 0.2)',
            border: '2px solid #00f0ff',
            borderRadius: '8px',
            color: '#00f0ff',
            padding: '8px 16px',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {showCalibration ? '✖ HIDE CALIBRATION TOOL' : '🎥 CALIBRATE CAMERA LIVE'}
        </button>

        {showCalibration && (
          <div style={{
            background: 'rgba(10, 16, 28, 0.95)',
            border: '2px solid #00f0ff',
            borderRadius: '12px',
            padding: '16px 20px',
            width: '320px',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
            color: '#e2e8f0',
            fontFamily: 'Rajdhani, sans-serif',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontFamily: 'Orbitron', color: '#00f0ff', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
              🎥 LIVE 3D CAMERA PIPELINE
            </div>

            {/* Distance Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>DISTANCE RATIO:</span>
                <span style={{ color: '#00f0ff', fontWeight: 700 }}>{camDist.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={camDist}
                onChange={(e) => setCamDist(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* Height Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>CAMERA HEIGHT (Y):</span>
                <span style={{ color: '#00f0ff', fontWeight: 700 }}>{camHeight.toFixed(2)}m</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.5"
                step="0.05"
                value={camHeight}
                onChange={(e) => setCamHeight(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* LookAt Offset Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>LOOKAT OFFSET:</span>
                <span style={{ color: '#00f0ff', fontWeight: 700 }}>{camLookOffset.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.2"
                step="0.05"
                value={camLookOffset}
                onChange={(e) => setCamLookOffset(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* FOV Slider */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>FIELD OF VIEW (FOV):</span>
                <span style={{ color: '#00f0ff', fontWeight: 700 }}>{camFov}°</span>
              </div>
              <input
                type="range"
                min="35"
                max="80"
                step="1"
                value={camFov}
                onChange={(e) => setCamFov(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
              />
            </div>

            {/* Preset Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => { setCamDist(1.38); setCamHeight(1.85); setCamLookOffset(0.85); setCamFov(52); }}
                style={{
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  padding: '6px',
                  borderRadius: '6px',
                  fontFamily: 'Orbitron',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                🎯 BALANCED DESK
              </button>
              <button
                onClick={() => { setCamDist(1.65); setCamHeight(2.40); setCamLookOffset(0.70); setCamFov(52); }}
                style={{
                  background: 'rgba(255, 170, 0, 0.15)',
                  border: '1px solid #ffaa00',
                  color: '#ffaa00',
                  padding: '6px',
                  borderRadius: '6px',
                  fontFamily: 'Orbitron',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                🌐 ROOM VIEW
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlRoomScene;
