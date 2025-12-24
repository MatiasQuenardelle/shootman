export const GAME_CONFIG = {
  // Targets
  TARGET_MIN_SIZE: 40,
  TARGET_MAX_SIZE: 80,
  TARGET_BASE_SPEED: 2,
  SPAWN_INTERVAL: 2000, // ms
  MAX_TARGETS: 5,

  // Scoring
  POINTS_PER_HIT: 100,
  COMBO_MULTIPLIER: 1.5,
  BONUS_TARGET_MULTIPLIER: 3,

  // Difficulty
  DIFFICULTY_INCREASE_RATE: 0.1,
  WAVE_TARGET_COUNT: 10,
  MAX_DIFFICULTY: 5,

  // Hand tracking
  HAND_DETECTION_CONFIDENCE: 0.3, // lower = more detections but more noise
  SHOOT_THRESHOLD: 0.025, // thumb movement threshold (lower = easier to shoot)
  SHOOT_COOLDOWN: 150, // ms between shots
  AIM_SMOOTHING: 0.85, // higher = more responsive
  AIM_SENSITIVITY: 1.4, // multiplier for aim movement (higher = faster cursor)

  // Game
  STARTING_LIVES: 3,
  MISSED_TARGET_PENALTY: 1, // life lost when target escapes

  // Visual
  CROSSHAIR_SIZE: 60,
  HIT_EFFECT_DURATION: 500, // ms
  MUZZLE_FLASH_DURATION: 100, // ms

  // Camera
  CAMERA_WIDTH: 640,
  CAMERA_HEIGHT: 480,

  // Target types configuration
  TARGET_TYPES: {
    normal: {
      sizeMultiplier: 1,
      speedMultiplier: 1,
      points: 100,
      health: 1,
      spawnWeight: 30,
    },
    fast: {
      sizeMultiplier: 0.8,
      speedMultiplier: 2,
      points: 150,
      health: 1,
      spawnWeight: 15,
    },
    small: {
      sizeMultiplier: 0.5,
      speedMultiplier: 1.2,
      points: 200,
      health: 1,
      spawnWeight: 10,
    },
    bonus: {
      sizeMultiplier: 1.2,
      speedMultiplier: 1.5,
      points: 500,
      health: 1,
      spawnWeight: 5,
    },
    ufo: {
      sizeMultiplier: 1.3,
      speedMultiplier: 1.3,
      points: 250,
      health: 2,
      spawnWeight: 15,
    },
    alien: {
      sizeMultiplier: 0.9,
      speedMultiplier: 1.4,
      points: 180,
      health: 1,
      spawnWeight: 12,
    },
    meteor: {
      sizeMultiplier: 1.1,
      speedMultiplier: 2.5,
      points: 300,
      health: 3,
      spawnWeight: 8,
    },
    planet: {
      sizeMultiplier: 1.5,
      speedMultiplier: 0.5,
      points: 150,
      health: 1,
      spawnWeight: 5,
    },
  },

  // Movement patterns weights
  MOVEMENT_PATTERNS: {
    linear: 40,
    sine: 30,
    random: 20,
    static: 10,
  },
} as const;

// Level configurations with creative variations
export const LEVELS = [
  {
    id: 1,
    name: 'Training Ground',
    description: 'Learn the basics - slow targets, no pressure',
    duration: 60,
    passScore: 500,
    threeStarScore: 1500,
    difficulty: 0,
    maxTargets: 3,
    spawnInterval: 2500,
    targetWeights: { normal: 50, fast: 10, small: 5, bonus: 5, ufo: 10, alien: 10, meteor: 5, planet: 5 },
    movementWeights: { linear: 60, sine: 20, random: 10, static: 10 },
    specialRules: { noLivesLoss: true },
  },
  {
    id: 2,
    name: 'Speed Demon',
    description: 'Fast targets everywhere - quick reflexes needed!',
    duration: 45,
    passScore: 800,
    threeStarScore: 2000,
    difficulty: 1,
    maxTargets: 5,
    spawnInterval: 1500,
    targetWeights: { normal: 15, fast: 40, small: 10, bonus: 5, ufo: 15, alien: 10, meteor: 3, planet: 2 },
    movementWeights: { linear: 50, sine: 30, random: 15, static: 5 },
  },
  {
    id: 3,
    name: 'Sharpshooter',
    description: 'Tiny targets - precision over speed',
    duration: 60,
    passScore: 1000,
    threeStarScore: 2500,
    difficulty: 1.5,
    maxTargets: 4,
    spawnInterval: 2000,
    targetWeights: { normal: 10, fast: 10, small: 50, bonus: 10, ufo: 5, alien: 10, meteor: 3, planet: 2 },
    movementWeights: { linear: 40, sine: 30, random: 20, static: 10 },
  },
  {
    id: 4,
    name: 'Bonus Frenzy',
    description: 'Golden opportunity - tons of bonus targets!',
    duration: 45,
    passScore: 2000,
    threeStarScore: 5000,
    difficulty: 1,
    maxTargets: 6,
    spawnInterval: 1200,
    targetWeights: { normal: 20, fast: 10, small: 10, bonus: 40, ufo: 8, alien: 7, meteor: 3, planet: 2 },
    movementWeights: { linear: 30, sine: 40, random: 20, static: 10 },
  },
  {
    id: 5,
    name: 'Time Attack',
    description: 'Each hit adds time - keep shooting to survive!',
    duration: 30,
    passScore: 1500,
    threeStarScore: 4000,
    difficulty: 2,
    maxTargets: 5,
    spawnInterval: 1000,
    targetWeights: { normal: 25, fast: 20, small: 15, bonus: 10, ufo: 12, alien: 10, meteor: 5, planet: 3 },
    movementWeights: { linear: 25, sine: 35, random: 30, static: 10 },
    specialRules: { bonusTimePerHit: 1.5 },
  },
  {
    id: 6,
    name: 'Chaos Theory',
    description: 'Unpredictable movement patterns everywhere',
    duration: 50,
    passScore: 1200,
    threeStarScore: 3000,
    difficulty: 2,
    maxTargets: 6,
    spawnInterval: 1400,
    targetWeights: { normal: 20, fast: 18, small: 18, bonus: 15, ufo: 12, alien: 10, meteor: 5, planet: 2 },
    movementWeights: { linear: 10, sine: 30, random: 50, static: 10 },
  },
  {
    id: 7,
    name: 'Ghost Hunt',
    description: 'Targets fade in and out - shoot when you can see them!',
    duration: 60,
    passScore: 1000,
    threeStarScore: 2800,
    difficulty: 2.5,
    maxTargets: 5,
    spawnInterval: 1800,
    targetWeights: { normal: 25, fast: 15, small: 15, bonus: 15, ufo: 12, alien: 10, meteor: 5, planet: 3 },
    movementWeights: { linear: 40, sine: 30, random: 20, static: 10 },
    specialRules: { invisibleTargets: true },
  },
  {
    id: 8,
    name: 'Pressure Cooker',
    description: 'Targets speed up over time - survive the acceleration!',
    duration: 50,
    passScore: 1500,
    threeStarScore: 3500,
    difficulty: 2.5,
    maxTargets: 6,
    spawnInterval: 1300,
    targetWeights: { normal: 20, fast: 25, small: 15, bonus: 10, ufo: 12, alien: 10, meteor: 6, planet: 2 },
    movementWeights: { linear: 35, sine: 35, random: 25, static: 5 },
    specialRules: { speedRamp: true },
  },
  {
    id: 9,
    name: 'Sniper Elite',
    description: 'Shrinking targets - hit them before they disappear!',
    duration: 55,
    passScore: 1800,
    threeStarScore: 4000,
    difficulty: 3,
    maxTargets: 5,
    spawnInterval: 1500,
    targetWeights: { normal: 18, fast: 18, small: 22, bonus: 15, ufo: 10, alien: 10, meteor: 5, planet: 2 },
    movementWeights: { linear: 30, sine: 40, random: 25, static: 5 },
    specialRules: { shrinkingTargets: true },
  },
  {
    id: 10,
    name: 'Final Showdown',
    description: 'Everything at once - prove you are the ultimate shooter!',
    duration: 60,
    passScore: 2500,
    threeStarScore: 6000,
    difficulty: 4,
    maxTargets: 8,
    spawnInterval: 800,
    targetWeights: { normal: 15, fast: 15, small: 15, bonus: 20, ufo: 12, alien: 12, meteor: 8, planet: 3 },
    movementWeights: { linear: 20, sine: 30, random: 40, static: 10 },
    specialRules: { speedRamp: true, shrinkingTargets: true },
  },
] as const;

// Hand landmark indices
export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

// Colors
export const COLORS = {
  primary: '#ef4444', // red-500
  secondary: '#3b82f6', // blue-500
  success: '#22c55e', // green-500
  warning: '#eab308', // yellow-500
  background: '#0f172a', // slate-900
  text: '#f8fafc', // slate-50
  muted: '#64748b', // slate-500
} as const;
