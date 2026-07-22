import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { playClick, playLaserLock, playVoteCast } from '../services/audio';

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
 * Renders fully interactive 3D PC/Laptop Computer Monitors for each workstation desk!
 * Players play and view the game choices DIRECTLY ON THE 3D VIRTUAL COMPUTER SCREEN MESH!
 * 
 * @param {Object} props
 * @param {Object} [props.gameState] - State object containing game & player data
 * @param {string} [props.currentPhase='lobby'] - Current phase ('lobby', 'question', 'discussion', 'voting', 'victory')
 * @param {number} [props.activePlayerIndex=0] - Index of active player (0-5)
 * @param {Function} [props.onSelectOption] - Callback when option choice is selected (0, 1, 2, 3)
 * @param {Function} [props.onConfirmAnswer] - Callback when answer is locked in
 */
export function ControlRoomScene({
  gameState,
  currentPhase = 'lobby',
  activePlayerIndex = 0,
  onSelectOption,
  onConfirmAnswer,
}) {
  const containerRef = useRef(null);

  // Store mutable refs for animation loop & interaction state
  const sceneStateRef = useRef({
    currentPhase,
    activePlayerIndex,
    gameState,
    onSelectOption,
    onConfirmAnswer,
    hoveredOptionIdx: null,
    hoveredLockIn: false,
  });

  // Keep refs synchronized with props
  useEffect(() => {
    sceneStateRef.current.currentPhase = currentPhase;
    sceneStateRef.current.activePlayerIndex = activePlayerIndex;
    sceneStateRef.current.gameState = gameState;
    sceneStateRef.current.onSelectOption = onSelectOption;
    sceneStateRef.current.onConfirmAnswer = onConfirmAnswer;
  }, [currentPhase, activePlayerIndex, gameState, onSelectOption, onConfirmAnswer]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. SCENE, CAMERA & RENDERER SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050711);
    scene.fog = new THREE.FogExp2(0x050711, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 10, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Clean container & attach canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // --- 2. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x1a2638, 1.5);
    scene.add(ambientLight);

    // Central Cyan Hologram Light
    const holoLightCyan = new THREE.PointLight(0x00f3ff, 4, 20);
    holoLightCyan.position.set(0, 3, 0);
    scene.add(holoLightCyan);

    // Central Amber Accent Light
    const holoLightAmber = new THREE.PointLight(0xff9900, 2.5, 18);
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
      color: 0x090d16,
      roughness: 0.2,
      metalness: 0.8,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.01;
    floorGroup.add(floorMesh);

    // Cyan Grid Helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x00f3ff, 0x0a3556);
    gridHelper.position.y = 0;
    floorGroup.add(gridHelper);

    // Concentric glowing ring floor markers
    const ringGeo1 = new THREE.RingGeometry(7.2, 7.4, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = -Math.PI / 2;
    ringMesh1.position.y = 0.01;
    floorGroup.add(ringMesh1);

    const ringGeo2 = new THREE.RingGeometry(2.4, 2.55, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
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
      color: 0x111827,
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

    // --- 5. 6 PLAYER WORKSTATIONS WITH INTERACTIVE 3D VIRTUAL COMPUTER MONITORS ---
    const consoleCount = 6;
    const consoleRadius = 7.5;
    const consoleGroup = new THREE.Group();
    const consoleStatusRings = [];
    const consoleLightMeshList = [];
    const consoleBezelMaterials = [];

    const screenCanvasList = [];
    const screenTextureList = [];
    const screenMeshList = [];

    const deskGeo = new THREE.BoxGeometry(2.2, 0.9, 1.4);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.7,
    });

    const monitorFrameGeo = new THREE.BoxGeometry(1.6, 1.0, 0.08);
    const monitorFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.9,
    });

    // Glowing Cyber Bezel Geometry framing the monitor
    const cyberBezelGeo = new THREE.BoxGeometry(1.64, 1.04, 0.04);

    const screenGeo = new THREE.PlaneGeometry(1.52, 0.92);
    const ringStatusGeo = new THREE.TorusGeometry(1.4, 0.06, 16, 32);

    for (let i = 0; i < consoleCount; i++) {
      const transform = getDeskScreenTransform(i, consoleCount, consoleRadius);
      const { deskX, deskZ } = transform;

      const pDeskGroup = new THREE.Group();
      pDeskGroup.position.set(deskX, 0, deskZ);

      // Desk mesh (center at Y=0.45, top surface at Y=0.90)
      const deskMesh = new THREE.Mesh(deskGeo, deskMat);
      deskMesh.position.set(0, 0.45, 0);
      pDeskGroup.add(deskMesh);

      // PC Monitor Stand
      const standGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.4, 16);
      const standMesh = new THREE.Mesh(standGeo, monitorFrameMat);
      standMesh.position.set(0, 0.65, 0.1);
      pDeskGroup.add(standMesh);

      // PC Monitor Outer Frame
      const frameMesh = new THREE.Mesh(monitorFrameGeo, monitorFrameMat);
      frameMesh.position.set(0, 1.38, 0.1);
      frameMesh.rotation.x = -Math.PI / 16;
      pDeskGroup.add(frameMesh);

      // Glowing Cyber Bezel Frame around PC Monitor
      const bezelMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      });
      const bezelMesh = new THREE.Mesh(cyberBezelGeo, bezelMat);
      bezelMesh.position.set(0, 1.38, 0.09);
      bezelMesh.rotation.x = -Math.PI / 16;
      pDeskGroup.add(bezelMesh);
      consoleBezelMaterials.push(bezelMat);

      // High-Definition HTML5 Canvas Texture for 3D PC Monitor Screen (1024 x 640)
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 640;
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      screenCanvasList.push(canvas);
      screenTextureList.push(texture);

      const screenMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });

      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 1.38, 0.056);
      screenMesh.rotation.x = -Math.PI / 16;
      screenMesh.userData = { playerIndex: i };
      pDeskGroup.add(screenMesh);
      screenMeshList.push(screenMesh);

      // Console status ring on ground around desk base
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
      const cLight = new THREE.PointLight(0x00f3ff, 0.8, 4);
      cLight.position.set(0, 1.38, 0.2);
      pDeskGroup.add(cLight);

      // Orient desk facing outward from center towards player camera seat
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

    // --- 7. HELPER TO DRAW INTERACTIVE 3D VIRTUAL PC MONITOR SCREEN TEXTURES ---
    const update3DScreenTextures = (state, phase, activeIdx) => {
      try {
        const players = state?.players || [];
        const questionObj = state?.currentQuestion || state?.question;
        
        let qText = 'SECURITY CHECK PROMPT';
        if (questionObj) {
          if (typeof questionObj === 'string') qText = questionObj;
          else if (questionObj.question) qText = String(questionObj.question);
          else if (questionObj.text) qText = String(questionObj.text);
        }

        let rawOptions = [];
        if (questionObj && Array.isArray(questionObj.options)) rawOptions = questionObj.options;
        else if (state && Array.isArray(state.options)) rawOptions = state.options;
        if (rawOptions.length === 0) rawOptions = ['Option A', 'Option B', 'Option C', 'Option D'];

        const { hoveredOptionIdx, hoveredLockIn } = sceneStateRef.current;

        screenCanvasList.forEach((canvas, idx) => {
          const ctx = canvas.getContext('2d');
          const texture = screenTextureList[idx];
          const player = players[idx];
          const isSpy = idx === state?.spyIndex;
          const isQuestionPhase = phase === 'question';
          const isRevealed = phase === 'discussion' || phase === 'voting' || phase === 'victory';
          const isActiveDesk = idx === activeIdx;

          // Clear Screen & Vibrant Dark Cyber Background
          ctx.fillStyle = '#0b1326';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid scanline texture
          ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
          for (let y = 0; y < canvas.height; y += 8) {
            ctx.fillRect(0, y, canvas.width, 4);
          }

          // Screen Bezel Border Glow
          ctx.strokeStyle = isSpy && isQuestionPhase ? '#ff0055' : isActiveDesk ? '#00f0ff' : 'rgba(0, 240, 255, 0.5)';
          ctx.lineWidth = 10;
          ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

          // --- TOP MONITOR HEADER BAR ---
          ctx.fillStyle = isSpy && isQuestionPhase ? 'rgba(255, 0, 85, 0.28)' : 'rgba(0, 240, 255, 0.22)';
          ctx.fillRect(12, 12, canvas.width - 24, 60);

          ctx.font = 'bold 24px Orbitron, sans-serif';
          ctx.fillStyle = isSpy && isQuestionPhase ? '#ff0055' : '#00f0ff';
          const pNameStr = player?.name ? String(player.name).toUpperCase() : `AGENT 0${idx + 1}`;
          ctx.fillText(`STATION 0${idx + 1} // OPERATIVE: ${pNameStr}`, 26, 50);

          // System Clock / Status Top Right
          ctx.font = 'bold 20px Orbitron, sans-serif';
          const sysTimeStr = new Date().toTimeString().split(' ')[0];
          ctx.fillStyle = isSpy && isQuestionPhase ? '#ff0055' : '#00ffaa';
          ctx.fillText(`SYS: ${sysTimeStr}`, canvas.width - 230, 50);

          // --- ROLE BADGE ---
          const badgeY = 88;
          if (!isSpy || !isQuestionPhase) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
            ctx.fillRect(26, badgeY, 560, 36);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(26, badgeY, 560, 36);

            ctx.font = 'bold 16px Orbitron, sans-serif';
            ctx.fillStyle = '#00f0ff';
            ctx.fillText('🛡️ AGENT - SECURITY QUESTION ASSIGNED', 40, badgeY + 24);
          } else {
            ctx.fillStyle = 'rgba(255, 0, 85, 0.3)';
            ctx.fillRect(26, badgeY, 640, 36);
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 2;
            ctx.strokeRect(26, badgeY, 640, 36);

            ctx.font = 'bold 16px Orbitron, sans-serif';
            ctx.fillStyle = '#ff0055';
            ctx.fillText('⚠️ INTRUDER ALERT - QUESTION CLASSIFIED! INFER FROM CHOICES', 40, badgeY + 24);
          }

          // --- QUESTION PROMPT / SPY WARNING BOX ---
          const qBoxY = 140;
          const qBoxH = 110;
          ctx.fillStyle = isSpy && isQuestionPhase ? 'rgba(35, 12, 24, 0.95)' : 'rgba(15, 25, 45, 0.95)';
          ctx.fillRect(26, qBoxY, 580, qBoxH);
          ctx.strokeStyle = isSpy && isQuestionPhase ? '#ff0055' : '#00f0ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(26, qBoxY, 580, qBoxH);

          // Left accent indicator bar
          ctx.fillStyle = isSpy && isQuestionPhase ? '#ff0055' : '#00f0ff';
          ctx.fillRect(26, qBoxY, 8, qBoxH);

          ctx.font = 'bold 14px Orbitron, sans-serif';
          ctx.fillStyle = isSpy && isQuestionPhase ? '#ff0055' : '#00f0ff';
          ctx.fillText('OPERATIVE_PROMPT >', 44, qBoxY + 28);

          if (isSpy && isQuestionPhase) {
            ctx.fillStyle = '#ff0055';
            ctx.font = 'bold 20px Orbitron, sans-serif';
            ctx.fillText('🔒 WARNING: SECURITY PROMPT ENCRYPTED', 44, qBoxY + 60);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '16px Rajdhani, sans-serif';
            ctx.fillText('Decryption key absent. Analyze choices below to deduce prompt & blend in.', 44, qBoxY + 88);
          } else {
            ctx.fillStyle = isRevealed ? '#00ffaa' : '#ffffff';
            ctx.font = 'bold 18px Rajdhani, sans-serif';

            // Word Wrap Question Prompt Text on 3D Monitor
            const safeQText = String(qText || '');
            const words = safeQText.split(' ');
            let line = '';
            let yPos = qBoxY + 58;
            for (let w of words) {
              const testLine = line + w + ' ';
              if (ctx.measureText(testLine).width > 530) {
                ctx.fillText(line, 44, yPos);
                line = w + ' ';
                yPos += 24;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, 44, yPos);
          }

          // --- LOCK-IN TRANSMISSION BUTTON (x: 630..995, y: 140..250) ---
          const btnX = 630;
          const btnY = 140;
          const btnW = 368;
          const btnH = 110;

          const playerAns = state?.playerAnswers?.[idx];
          const isConfirmed = state?.isAnswerConfirmed || Boolean(playerAns);
          const isBtnHovered = isActiveDesk && hoveredLockIn && !isConfirmed;

          ctx.fillStyle = isConfirmed
            ? '#10b981'
            : isBtnHovered
            ? 'rgba(0, 240, 255, 0.45)'
            : playerAns !== undefined
            ? 'rgba(0, 240, 255, 0.3)'
            : 'rgba(255, 255, 255, 0.12)';
          ctx.fillRect(btnX, btnY, btnW, btnH);

          ctx.strokeStyle = isConfirmed ? '#10b981' : isBtnHovered ? '#ffffff' : '#00f0ff';
          ctx.lineWidth = isBtnHovered ? 4 : 2;
          ctx.strokeRect(btnX, btnY, btnW, btnH);

          ctx.font = 'bold 22px Orbitron, sans-serif';
          ctx.fillStyle = isConfirmed ? '#ffffff' : playerAns !== undefined ? '#00f0ff' : '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(isConfirmed ? '✔ ANSWER TRANSMITTED' : '🔒 LOCK-IN ANSWER', btnX + btnW / 2, btnY + 52);

          ctx.font = 'bold 15px Orbitron, sans-serif';
          ctx.fillStyle = isConfirmed ? '#e2e8f0' : '#cbd5e1';
          ctx.fillText(isConfirmed ? 'CHOICE LOCKED IN' : '[CLICK OR PRESS ENTER]', btnX + btnW / 2, btnY + 84);
          ctx.textAlign = 'left';

          // --- 4 INTERACTIVE OPTION BOXES (A, B, C, D) ---
          const optBoxes = [
            { x: 26, y: 270, w: 470, h: 160, label: 'A' },
            { x: 524, y: 270, w: 471, h: 160, label: 'B' },
            { x: 26, y: 450, w: 470, h: 160, label: 'C' },
            { x: 524, y: 450, w: 471, h: 160, label: 'D' },
          ];

          rawOptions.slice(0, 4).forEach((optTextRaw, oIdx) => {
            const box = optBoxes[oIdx];
            const optString = String(typeof optTextRaw === 'string' ? optTextRaw : (optTextRaw?.text || optTextRaw?.label || ''));
            const isSelected = playerAns === optString || playerAns === oIdx || playerAns === box.label;
            const isHovered = isActiveDesk && hoveredOptionIdx === oIdx;

            // Box Fill
            ctx.fillStyle = isSelected
              ? 'rgba(0, 240, 255, 0.48)'
              : isHovered
              ? 'rgba(0, 240, 255, 0.28)'
              : 'rgba(18, 30, 52, 0.95)';
            ctx.fillRect(box.x, box.y, box.w, box.h);

            // Box Border
            ctx.strokeStyle = isSelected ? '#00f0ff' : isHovered ? '#ffffff' : 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2;
            ctx.strokeRect(box.x, box.y, box.w, box.h);

            // Letter Badge Box [A], [B], [C], [D]
            ctx.fillStyle = isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(box.x + 16, box.y + 16, 56, 56);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x + 16, box.y + 16, 56, 56);

            ctx.font = 'bold 28px Orbitron, sans-serif';
            ctx.fillStyle = isSelected ? '#020617' : '#00f0ff';
            ctx.fillText(box.label, box.x + 32, box.y + 54);

            // Key Binding Hint Tag [A]
            ctx.font = 'bold 12px Orbitron, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`KEY [${box.label}]`, box.x + 22, box.y + 96);

            // Option Text Word Wrap
            ctx.font = 'bold 22px Rajdhani, sans-serif';
            ctx.fillStyle = isSelected ? '#ffffff' : '#f1f5f9';

            const optWords = optString.split(' ');
            let optLine = '';
            let optY = box.y + 44;
            for (let w of optWords) {
              const testLine = optLine + w + ' ';
              if (ctx.measureText(testLine).width > box.w - 100) {
                ctx.fillText(optLine, box.x + 90, optY);
                optLine = w + ' ';
                optY += 28;
              } else {
                optLine = testLine;
              }
            }
            ctx.fillText(optLine, box.x + 90, optY);

            // Selected Pill Indicator
            if (isSelected) {
              ctx.fillStyle = '#00f0ff';
              ctx.fillRect(box.x + box.w - 140, box.y + 16, 124, 32);
              ctx.font = 'bold 14px Orbitron, sans-serif';
              ctx.fillStyle = '#020617';
              ctx.fillText('SELECTED ✓', box.x + box.w - 130, box.y + 38);
            }
          });

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
      if (phase !== 'question') return;

      const activeScreen = screenMeshList[activeIdx];
      if (!activeScreen) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(activeScreen);

      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv;
        const px = uv.x * 1024;
        const py = (1 - uv.y) * 640;

        let foundHoverOption = null;
        let foundHoverLockIn = false;

        // Check Lock-In Button bounds (x: 630..998, y: 140..250)
        if (px >= 630 && px <= 998 && py >= 140 && py <= 250) {
          foundHoverLockIn = true;
        }

        // Check 4 Option Boxes bounds
        const optBoxes = [
          { x: 26, y: 270, w: 470, h: 160, idx: 0 },
          { x: 524, y: 270, w: 471, h: 160, idx: 1 },
          { x: 26, y: 450, w: 470, h: 160, idx: 2 },
          { x: 524, y: 450, w: 471, h: 160, idx: 3 },
        ];

        optBoxes.forEach(b => {
          if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
            foundHoverOption = b.idx;
          }
        });

        sceneStateRef.current.hoveredOptionIdx = foundHoverOption;
        sceneStateRef.current.hoveredLockIn = foundHoverLockIn;

        if (foundHoverOption !== null || foundHoverLockIn) {
          renderer.domElement.style.cursor = 'pointer';
        } else {
          renderer.domElement.style.cursor = 'default';
        }
      } else {
        sceneStateRef.current.hoveredOptionIdx = null;
        sceneStateRef.current.hoveredLockIn = false;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handlePointerDown = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const { currentPhase: phase, activePlayerIndex: activeIdx, onSelectOption: selectCb, onConfirmAnswer: confirmCb, gameState: state } = sceneStateRef.current;
      if (phase !== 'question') return;

      const activeScreen = screenMeshList[activeIdx];
      if (!activeScreen) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(activeScreen);

      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv;
        const px = uv.x * 1024;
        const py = (1 - uv.y) * 640;

        // Click Lock-In Transmission Button
        if (px >= 630 && px <= 998 && py >= 140 && py <= 250) {
          playVoteCast();
          confirmCb?.();
          return;
        }

        // Click 4 Option Boxes
        const optBoxes = [
          { x: 26, y: 270, w: 470, h: 160, idx: 0 },
          { x: 524, y: 270, w: 471, h: 160, idx: 1 },
          { x: 26, y: 450, w: 470, h: 160, idx: 2 },
          { x: 524, y: 450, w: 471, h: 160, idx: 3 },
        ];

        optBoxes.forEach(b => {
          if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
            playLaserLock();
            selectCb?.(b.idx);
          }
        });
      }
    };

    // Keyboard Hotkeys (A, B, C, D / 1, 2, 3, 4 / Enter / Space)
    const handleKeyDown = (e) => {
      const { currentPhase: phase, onSelectOption: selectCb, onConfirmAnswer: confirmCb } = sceneStateRef.current;
      if (phase !== 'question') return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      const code = e.code;
      const key = e.key ? e.key.toUpperCase() : '';

      if (code === 'KeyA' || key === 'A' || key === '1') {
        playLaserLock();
        selectCb?.(0);
      } else if (code === 'KeyB' || key === 'B' || key === '2') {
        playLaserLock();
        selectCb?.(1);
      } else if (code === 'KeyC' || key === 'C' || key === '3') {
        playLaserLock();
        selectCb?.(2);
      } else if (code === 'KeyD' || key === 'D' || key === '4') {
        playLaserLock();
        selectCb?.(3);
      } else if (code === 'Enter' || code === 'Space' || key === 'ENTER' || key === ' ') {
        e.preventDefault();
        playVoteCast();
        confirmCb?.();
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
      const { currentPhase: phase, activePlayerIndex: activeIdx, gameState: state } = sceneStateRef.current;

      // Update interactive 3D PC monitor screens
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

        // Pulse intensity if active
        if (i === activeIdx) {
          light.intensity = 1.5 + Math.sin(elapsedTime * 5) * 0.7;
          if (bezelMat) bezelMat.opacity = 0.7 + Math.sin(elapsedTime * 5) * 0.25;
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

      switch (phase) {
        case 'question': {
          // Seated in player chair aiming directly at 3D PC monitor screen center
          const chairDist = 1.18;
          targetCamPos.set(activeX * chairDist, 1.45, activeZ * chairDist);
          targetLookAt.set(activeX, 1.38, activeZ);
          break;
        }
        case 'discussion': {
          // Wide dramatic shot of central holographic matrix
          const radius = 13.5;
          const slowOrbit = elapsedTime * 0.12;
          targetCamPos.set(
            Math.cos(slowOrbit) * radius,
            3.2 + Math.sin(elapsedTime * 0.4) * 0.8,
            Math.sin(slowOrbit) * radius
          );
          targetLookAt.set(0, 2.4, 0);
          break;
        }
        case 'voting': {
          // Dynamic low-angle security camera view
          targetCamPos.set(11.5, 1.6 + Math.sin(elapsedTime * 0.5) * 0.3, 11.5);
          targetLookAt.set(0, 2.0, 0);
          break;
        }
        case 'victory': {
          // High-energy orbiting zoom
          const fastOrbit = elapsedTime * 0.75;
          const r = 11.0 + Math.sin(elapsedTime * 1.5) * 2.5;
          targetCamPos.set(
            Math.cos(fastOrbit) * r,
            5.5 + Math.cos(elapsedTime * 1.2) * 1.8,
            Math.sin(fastOrbit) * r
          );
          targetLookAt.set(0, 2.8, 0);
          break;
        }
        default: {
          // 'lobby': Slow orbiting camera overview
          const orbitTime = elapsedTime * 0.15;
          targetCamPos.set(Math.cos(orbitTime) * 16, 8.5, Math.sin(orbitTime) * 16);
          targetLookAt.set(0, 1.8, 0);
          break;
        }
      }

      // Smooth lerp camera movement
      camera.position.lerp(targetCamPos, 0.05);
      currentLookAt.lerp(targetLookAt, 0.05);
      camera.lookAt(currentLookAt);

      // Smoothly update Field of View (FOV) for seated PC monitor view (52)
      const targetFov = phase === 'question' ? 52 : 55;
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
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'auto',
      }}
    />
  );
}

export default ControlRoomScene;
