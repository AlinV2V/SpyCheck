import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ControlRoomScene Component
 * 
 * 3D Sci-Fi Command Center background built with Three.js.
 * 
 * @param {Object} props
 * @param {Object} [props.gameState] - State object containing game & player data
 * @param {string} [props.currentPhase='lobby'] - Current phase ('lobby', 'question', 'discussion', 'voting', 'victory')
 * @param {number} [props.activePlayerIndex=0] - Index of active player (0-5)
 */
export function ControlRoomScene({ gameState, currentPhase = 'lobby', activePlayerIndex = 0 }) {
  const containerRef = useRef(null);

  // Store mutable refs for animation loop state
  const sceneStateRef = useRef({
    currentPhase,
    activePlayerIndex,
    gameState,
  });

  // Keep refs synchronized with props without re-triggering Three setup
  useEffect(() => {
    sceneStateRef.current.currentPhase = currentPhase;
    sceneStateRef.current.activePlayerIndex = activePlayerIndex;
    sceneStateRef.current.gameState = gameState;
  }, [currentPhase, activePlayerIndex, gameState]);

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

    // Holographic Particle Cloud (Rising particles inside cylinder)
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

    // --- 5. 6 PLAYER CONSOLES & STATUS LIGHT RINGS ---
    const consoleCount = 6;
    const consoleRadius = 7.5;
    const consoleGroup = new THREE.Group();
    const consoleStatusRings = [];
    const consoleLightMeshList = [];

    const deskGeo = new THREE.BoxGeometry(1.8, 0.9, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.7,
    });

    const screenGeo = new THREE.PlaneGeometry(1.2, 0.7);
    const ringStatusGeo = new THREE.TorusGeometry(1.3, 0.06, 16, 32);

    for (let i = 0; i < consoleCount; i++) {
      const angle = (i / consoleCount) * Math.PI * 2 + Math.PI / 6;
      const x = Math.cos(angle) * consoleRadius;
      const z = Math.sin(angle) * consoleRadius;

      const pDeskGroup = new THREE.Group();
      pDeskGroup.position.set(x, 0.45, z);

      // Desk mesh
      const deskMesh = new THREE.Mesh(deskGeo, deskMat);
      pDeskGroup.add(deskMesh);

      // Slanted Screen
      const screenMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0.65, 0.1);
      screenMesh.rotation.x = -Math.PI / 6;
      pDeskGroup.add(screenMesh);

      // Console status ring on ground around desk base
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.9,
      });
      const ringMesh = new THREE.Mesh(ringStatusGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, -0.44, 0);
      pDeskGroup.add(ringMesh);

      // Point light per console
      const cLight = new THREE.PointLight(0x00f3ff, 0.8, 4);
      cLight.position.set(0, 0.8, 0);
      pDeskGroup.add(cLight);

      // Orient desk facing the central holographic projector
      pDeskGroup.lookAt(0, 0.45, 0);

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
      starPositions[i * 3 + 1] = Math.random() * 22;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    scene.add(starParticles);

    // Outer Room Sci-Fi Pillars for Depth
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.6, 14, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.8 });
    for (let i = 0; i < 8; i++) {
      const pAngle = (i / 8) * Math.PI * 2;
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(Math.cos(pAngle) * 19, 7, Math.sin(pAngle) * 19);
      scene.add(pillar);
    }

    // --- 7. ANIMATION LOOP & DYNAMIC CAMERA STATE ---
    let animationFrameId;
    let clock = new THREE.Clock();

    const targetCamPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3(0, 1.5, 0);

    const cyanColor = new THREE.Color(0x00f3ff);
    const amberColor = new THREE.Color(0xffaa00);
    const redColor = new THREE.Color(0xff0055);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const { currentPhase: phase, activePlayerIndex: activeIdx, gameState: state } = sceneStateRef.current;

      // 7a. Rotate central hologram core and rings
      holoCore.rotation.x = elapsedTime * 0.4;
      holoCore.rotation.y = elapsedTime * 0.6;
      coreRing.rotation.z = elapsedTime * -0.5;
      coreRing.rotation.x = Math.sin(elapsedTime) * 0.3;
      holoCyl.rotation.y = elapsedTime * -0.15;

      // 7b. Animate rising holographic particles
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

      // 7c. Dynamic Status Lights on 6 Player Consoles
      for (let i = 0; i < consoleCount; i++) {
        const ringMat = consoleStatusRings[i];
        const light = consoleLightMeshList[i];
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
        } else {
          light.intensity = 0.6;
        }

        ringMat.color.lerp(targetColor, 0.08);
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

      // 7d. Camera choreography per currentPhase
      const validActiveIdx = Math.max(0, Math.min(consoleCount - 1, activeIdx || 0));
      const activeAngle = (validActiveIdx / consoleCount) * Math.PI * 2 + Math.PI / 6;
      const activeX = Math.cos(activeAngle) * consoleRadius;
      const activeZ = Math.sin(activeAngle) * consoleRadius;

      switch (phase) {
        case 'question': {
          // Focused view looking directly at active player console
          const camDist = 1.35;
          targetCamPos.set(activeX * camDist, 3.8, activeZ * camDist);
          targetLookAt.set(activeX * 0.45, 1.2, activeZ * 0.45);
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
          targetLookAt.set(0, 2.0, 0);
          break;
        }
        case 'lobby':
        default: {
          // Slow orbiting camera overview
          const orbit = elapsedTime * 0.18;
          targetCamPos.set(Math.cos(orbit) * 17.5, 9.5, Math.sin(orbit) * 17.5);
          targetLookAt.set(0, 1.5, 0);
          break;
        }
      }

      // Smoothly interpolate camera position & lookAt target
      camera.position.lerp(targetCamPos, 0.045);
      currentLookAt.lerp(targetLookAt, 0.05);
      camera.lookAt(currentLookAt);

      // Render scene
      renderer.render(scene, camera);
    };

    animate();

    // --- 8. RESIZE HANDLER ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth || window.innerWidth;
      const newH = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- 9. CLEANUP ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();

      // Dispose scene objects & renderer
      floorGeo.dispose();
      floorMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();

      podBaseGeo.dispose();
      podBaseMat.dispose();
      emitterRingGeo.dispose();
      emitterRingMat.dispose();
      holoCylGeo.dispose();
      holoCylMat.dispose();
      holoCoreGeo.dispose();
      holoCoreMat.dispose();
      coreRingGeo.dispose();
      coreRingMat.dispose();
      holoParticleGeo.dispose();
      holoParticleMat.dispose();

      deskGeo.dispose();
      deskMat.dispose();
      screenGeo.dispose();
      ringStatusGeo.dispose();

      starGeo.dispose();
      starMat.dispose();
      pillarGeo.dispose();
      pillarMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

export default ControlRoomScene;
