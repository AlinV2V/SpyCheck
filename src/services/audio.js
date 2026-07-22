/**
 * Procedural Web Audio API Sound Synthesizer for Intruder Check / SpyCheck
 * Cybernetic & Sci-Fi aesthetic procedural sound effects without external audio files.
 */

let audioCtx = null;
let isMutedState = false;

/**
 * Initialize or resume the AudioContext.
 * Call this inside a user gesture handler (e.g., click, touch) to comply with browser audio policies.
 */
export const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

/**
 * Toggle or set the mute state.
 * @param {boolean} muted 
 */
export const setMuted = (muted) => {
  isMutedState = Boolean(muted);
};

/**
 * Check if audio is currently muted.
 * @returns {boolean}
 */
export const isMuted = () => isMutedState;

/**
 * Helper to acquire a valid, running AudioContext if unmuted.
 */
const getContext = () => {
  if (isMutedState) return null;
  if (!audioCtx) {
    initAudio();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (!audioCtx || audioCtx.state !== 'running') return null;
  return audioCtx;
};

/**
 * Create a noise buffer (white noise) for percussion & impacts.
 */
const createNoiseBuffer = (ctx, duration = 0.2) => {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

/**
 * Play a crisp cybernetic UI click.
 */
export const playClick = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Tone generator
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);

  // Micro high-hat noise transient
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 0.015);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.015);
};

/**
 * Play a laser lock-in sound when selecting an option or answer.
 */
export const playLaserLock = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Laser chirper
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(350, now);
  osc.frequency.exponentialRampToValueAtTime(2200, now + 0.12);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500, now);
  filter.frequency.linearRampToValueAtTime(3500, now + 0.12);
  filter.Q.setValueAtTime(5, now);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.14);

  // Metallic Lock Ring
  const ring = ctx.createOscillator();
  const ringGain = ctx.createGain();
  ring.type = 'sine';
  ring.frequency.setValueAtTime(1760, now + 0.05); // A6
  ringGain.gain.setValueAtTime(0, now);
  ringGain.gain.setValueAtTime(0.15, now + 0.05);
  ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  ring.connect(ringGain);
  ringGain.connect(ctx.destination);

  ring.start(now + 0.05);
  ring.stop(now + 0.2);
};

/**
 * Play a dramatic intruder alert alarm siren.
 */
export const playAlertSiren = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Dual tone siren with sweep
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc2.type = 'square';

  // Pitch modulation over 1 second
  osc1.frequency.setValueAtTime(440, now);
  osc1.frequency.linearRampToValueAtTime(880, now + 0.25);
  osc1.frequency.linearRampToValueAtTime(440, now + 0.5);
  osc1.frequency.linearRampToValueAtTime(880, now + 0.75);
  osc1.frequency.linearRampToValueAtTime(440, now + 1.0);

  osc2.frequency.setValueAtTime(444, now);
  osc2.frequency.linearRampToValueAtTime(888, now + 0.25);
  osc2.frequency.linearRampToValueAtTime(444, now + 0.5);
  osc2.frequency.linearRampToValueAtTime(888, now + 0.75);
  osc2.frequency.linearRampToValueAtTime(444, now + 1.0);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(3, now);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
  gain.gain.setValueAtTime(0.2, now + 0.9);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 1.1);
  osc2.stop(now + 1.1);
};

/**
 * Play high-tech countdown tick.
 * @param {boolean} isUrgent - whether the timer is in urgent mode (e.g. final 5 seconds)
 */
export const playTimerTick = (isUrgent = false) => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (isUrgent) {
    // Urgent tick: double pitch synth alert
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } else {
    // Standard cyber tick
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }
};

/**
 * Play a futuristic vote confirmation pulse.
 */
export const playVoteCast = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Sub-bass heavy impact pulse
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();

  sub.type = 'sine';
  sub.frequency.setValueAtTime(150, now);
  sub.frequency.exponentialRampToValueAtTime(40, now + 0.25);

  subGain.gain.setValueAtTime(0.4, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  sub.connect(subGain);
  subGain.connect(ctx.destination);

  sub.start(now);
  sub.stop(now + 0.25);

  // Cyber lock arpeggio pulse
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, idx) => {
    const noteOsc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    noteOsc.type = 'triangle';
    noteOsc.frequency.setValueAtTime(freq, now + idx * 0.04);

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.setValueAtTime(0.15, now + idx * 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.08);

    noteOsc.connect(noteGain);
    noteGain.connect(ctx.destination);

    noteOsc.start(now + idx * 0.04);
    noteOsc.stop(now + idx * 0.04 + 0.08);
  });
};

/**
 * Play dramatic reveal sting.
 * @param {boolean} isSpyCaught - true if intruder/spy was caught, false if innocent eliminated / spy escaped.
 */
export const playRevealSting = (isSpyCaught = true) => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (isSpyCaught) {
    // Triumphant intruder caught sting: Power chord + rising synth brass
    const chordFreqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    chordFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(4000, now + 0.3);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  } else {
    // Intruder escaped / innocent sting: Dark low dissonance drop
    const darkFreqs = [220.00, 233.08, 110.00]; // A3, Bb3, A2 (dissonant semitone + sub)
    darkFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.9);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.9);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    });
  }
};

/**
 * Play Victory fanfare.
 */
export const playVictory = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 523.25, time: 0.00, dur: 0.12 }, // C5
    { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
    { freq: 783.99, time: 0.24, dur: 0.12 }, // G5
    { freq: 1046.50, time: 0.36, dur: 0.50 }  // C6
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.2, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
};

/**
 * Play Defeat fanfare.
 */
export const playDefeat = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 415.30, time: 0.00, dur: 0.20 }, // Ab4
    { freq: 349.23, time: 0.20, dur: 0.20 }, // F4
    { freq: 277.18, time: 0.40, dur: 0.20 }, // Db4
    { freq: 261.63, time: 0.60, dur: 0.60 }  // C4
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now + time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now + time);
    filter.frequency.exponentialRampToValueAtTime(200, now + time + dur);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.18, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
};

/**
 * Play low CRT monitor power-on hum and pitch sweep sound.
 * Triggered when camera zooms into PC monitor screen or terminal initializes.
 */
export const playTerminalPowerOn = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Initial High-voltage relay click/snap
  const relayClick = ctx.createOscillator();
  const relayGain = ctx.createGain();
  relayClick.type = 'triangle';
  relayClick.frequency.setValueAtTime(2400, now);
  relayClick.frequency.exponentialRampToValueAtTime(120, now + 0.015);
  relayGain.gain.setValueAtTime(0.2, now);
  relayGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  relayClick.connect(relayGain);
  relayGain.connect(ctx.destination);
  relayClick.start(now);
  relayClick.stop(now + 0.015);

  // 2. CRT Hum (low frequency 60 Hz hum with 120 Hz harmonic)
  const humOsc1 = ctx.createOscillator();
  const humOsc2 = ctx.createOscillator();
  const humGain = ctx.createGain();
  const humFilter = ctx.createBiquadFilter();

  humOsc1.type = 'sawtooth';
  humOsc1.frequency.setValueAtTime(60, now);

  humOsc2.type = 'sine';
  humOsc2.frequency.setValueAtTime(120, now);

  humFilter.type = 'lowpass';
  humFilter.frequency.setValueAtTime(250, now);

  humGain.gain.setValueAtTime(0.001, now);
  humGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
  humGain.gain.setValueAtTime(0.18, now + 0.5);
  humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  humOsc1.connect(humFilter);
  humOsc2.connect(humFilter);
  humFilter.connect(humGain);
  humGain.connect(ctx.destination);

  humOsc1.start(now);
  humOsc2.start(now);
  humOsc1.stop(now + 0.85);
  humOsc2.stop(now + 0.85);

  // 3. CRT Cathode Frequency Sweep (rising pitch sweep as beam powers on and camera zooms in)
  const sweepOsc = ctx.createOscillator();
  const sweepGain = ctx.createGain();
  const sweepFilter = ctx.createBiquadFilter();

  sweepOsc.type = 'sine';
  sweepOsc.frequency.setValueAtTime(110, now + 0.02);
  sweepOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.55);

  sweepFilter.type = 'bandpass';
  sweepFilter.frequency.setValueAtTime(300, now + 0.02);
  sweepFilter.frequency.exponentialRampToValueAtTime(2200, now + 0.55);
  sweepFilter.Q.setValueAtTime(4, now);

  sweepGain.gain.setValueAtTime(0, now + 0.02);
  sweepGain.gain.linearRampToValueAtTime(0.15, now + 0.15);
  sweepGain.gain.setValueAtTime(0.15, now + 0.4);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

  sweepOsc.connect(sweepFilter);
  sweepFilter.connect(sweepGain);
  sweepGain.connect(ctx.destination);

  sweepOsc.start(now + 0.02);
  sweepOsc.stop(now + 0.65);
};

/**
 * Play crisp mechanical keyboard switch click sound when typing or selecting options (A/B/C/D).
 */
export const playKeypress = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Slight pitch variation for realistic non-repetitive key clicks
  const pitchVar = 0.94 + Math.random() * 0.12;

  // 1. High-frequency switch click / spring snap transient
  const snapOsc = ctx.createOscillator();
  const snapGain = ctx.createGain();
  snapOsc.type = 'triangle';
  snapOsc.frequency.setValueAtTime(3200 * pitchVar, now);
  snapOsc.frequency.exponentialRampToValueAtTime(800 * pitchVar, now + 0.012);

  snapGain.gain.setValueAtTime(0.18, now);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  snapOsc.connect(snapGain);
  snapGain.connect(ctx.destination);
  snapOsc.start(now);
  snapOsc.stop(now + 0.015);

  // 2. High-pass noise burst (plastic keycap contact noise)
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, 0.015);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(2800 * pitchVar, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.14, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noiseSource.start(now);
  noiseSource.stop(now + 0.015);

  // 3. Mechanical switch body bottom-out thock (low-mid resonance)
  const thockOsc = ctx.createOscillator();
  const thockGain = ctx.createGain();
  thockOsc.type = 'sine';
  thockOsc.frequency.setValueAtTime(420 * pitchVar, now);
  thockOsc.frequency.exponentialRampToValueAtTime(120 * pitchVar, now + 0.025);

  thockGain.gain.setValueAtTime(0.12, now);
  thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  thockOsc.connect(thockGain);
  thockGain.connect(ctx.destination);
  thockOsc.start(now);
  thockOsc.stop(now + 0.025);
};

/**
 * Play sci-fi data packet send burst sound when locking in an answer.
 */
export const playTransmissionSent = () => {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Rapid digital data packet chirp sequence (4 fast micro-blips)
  const blipFreqs = [1046.50, 1567.98, 2093.00, 2793.83];
  blipFreqs.forEach((freq, i) => {
    const blipOsc = ctx.createOscillator();
    const blipGain = ctx.createGain();
    const blipTime = now + i * 0.025;

    blipOsc.type = 'square';
    blipOsc.frequency.setValueAtTime(freq, blipTime);
    blipOsc.frequency.exponentialRampToValueAtTime(freq * 1.2, blipTime + 0.02);

    blipGain.gain.setValueAtTime(0, blipTime);
    blipGain.gain.setValueAtTime(0.12, blipTime);
    blipGain.gain.exponentialRampToValueAtTime(0.001, blipTime + 0.02);

    blipOsc.connect(blipGain);
    blipGain.connect(ctx.destination);

    blipOsc.start(blipTime);
    blipOsc.stop(blipTime + 0.02);
  });

  // 2. Sci-fi transmission beam / telemetry filter sweep
  const beamOsc = ctx.createOscillator();
  const beamGain = ctx.createGain();
  const beamFilter = ctx.createBiquadFilter();

  const sweepStartTime = now + 0.06;
  beamOsc.type = 'sawtooth';
  beamOsc.frequency.setValueAtTime(440, sweepStartTime);
  beamOsc.frequency.exponentialRampToValueAtTime(3200, sweepStartTime + 0.22);

  beamFilter.type = 'bandpass';
  beamFilter.frequency.setValueAtTime(800, sweepStartTime);
  beamFilter.frequency.exponentialRampToValueAtTime(4000, sweepStartTime + 0.22);
  beamFilter.Q.setValueAtTime(6, sweepStartTime);

  beamGain.gain.setValueAtTime(0, sweepStartTime);
  beamGain.gain.linearRampToValueAtTime(0.2, sweepStartTime + 0.05);
  beamGain.gain.exponentialRampToValueAtTime(0.001, sweepStartTime + 0.25);

  beamOsc.connect(beamFilter);
  beamFilter.connect(beamGain);
  beamGain.connect(ctx.destination);

  beamOsc.start(sweepStartTime);
  beamOsc.stop(sweepStartTime + 0.25);

  // 3. Low-frequency confirmation lock thump
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();

  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(180, now);
  subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

  subGain.gain.setValueAtTime(0.25, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  subOsc.connect(subGain);
  subGain.connect(ctx.destination);

  subOsc.start(now);
  subOsc.stop(now + 0.18);
};

export default {
  initAudio,
  setMuted,
  isMuted,
  playClick,
  playLaserLock,
  playAlertSiren,
  playTimerTick,
  playVoteCast,
  playRevealSting,
  playVictory,
  playDefeat,
  playTerminalPowerOn,
  playKeypress,
  playTransmissionSent
};
