import { Achievement, DailyChallenge, GameSettings } from '@/types';

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
  HAND_DETECTION_CONFIDENCE: 0.2,
  SHOOT_THRESHOLD: 0.018,
  SHOOT_COOLDOWN: 300,
  SHOOT_THRESHOLD_ABSOLUTE: 0.06,
  AIM_SMOOTHING: 0.25,
  AIM_SENSITIVITY: 1.1,
  AIM_FREEZE_THRESHOLD: 0.015,
  AIM_FREEZE_DURATION: 200,

  // Game
  STARTING_LIVES: 3,
  MISSED_TARGET_PENALTY: 1,

  // Ammo & Reload
  MAX_AMMO: 12,
  RELOAD_TIME: 1500, // ms
  RAPID_FIRE_COOLDOWN: 100, // ms when rapid fire active

  // Visual
  CROSSHAIR_SIZE: 60,
  HIT_EFFECT_DURATION: 500,
  MUZZLE_FLASH_DURATION: 100,
  SCREEN_SHAKE_DECAY: 0.9,
  SCREEN_SHAKE_MAX: 20,

  // Camera
  CAMERA_WIDTH: 640,
  CAMERA_HEIGHT: 480,

  // Power-ups
  POWERUP_SPAWN_INTERVAL: 15000, // ms
  POWERUP_SIZE: 50,
  POWERUP_DURATION: {
    slowmo: 5000,
    rapidfire: 8000,
    spreadshot: 10000,
    magnet: 8000,
    shield: 10000,
    doublepoints: 12000,
  },
  SLOWMO_SCALE: 0.3, // time scale during slow-mo
  MAGNET_RANGE: 200, // pixels
  SPREAD_SHOT_ANGLES: [-15, 0, 15], // degrees

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
    // New target types
    explosive: {
      sizeMultiplier: 1.0,
      speedMultiplier: 1.0,
      points: 200,
      health: 1,
      spawnWeight: 8,
      explosionRadius: 100,
    },
    split: {
      sizeMultiplier: 1.2,
      speedMultiplier: 0.8,
      points: 150,
      health: 1,
      spawnWeight: 8,
      splitCount: 3,
    },
    shield: {
      sizeMultiplier: 1.1,
      speedMultiplier: 0.9,
      points: 300,
      health: 3,
      spawnWeight: 6,
    },
    decoy: {
      sizeMultiplier: 1.0,
      speedMultiplier: 1.2,
      points: -100, // penalty for shooting
      health: 1,
      spawnWeight: 5,
    },
    timefreeze: {
      sizeMultiplier: 0.9,
      speedMultiplier: 1.5,
      points: 250,
      health: 1,
      spawnWeight: 4,
      freezeDuration: 3000,
    },
    boss: {
      sizeMultiplier: 3.0,
      speedMultiplier: 0.5,
      points: 2000,
      health: 20,
      spawnWeight: 0, // spawned specially
    },
  },

  // Movement patterns weights
  MOVEMENT_PATTERNS: {
    linear: 40,
    sine: 30,
    random: 20,
    static: 10,
  },

  // Boss configurations
  BOSS_CONFIG: {
    phases: 3,
    healthPerPhase: 7,
    attackInterval: 2000,
    moveSpeed: 1.5,
  },

  // Two-player mode
  PLAYER_COLORS: {
    1: '#ef4444', // red
    2: '#3b82f6', // blue
  },
} as const;

// Power-up configurations
export const POWERUP_CONFIG = {
  slowmo: {
    name: 'Slow Motion',
    icon: '🕐',
    color: '#8b5cf6',
    description: 'Slows down time',
  },
  rapidfire: {
    name: 'Rapid Fire',
    icon: '🔥',
    color: '#ef4444',
    description: 'Faster shooting',
  },
  spreadshot: {
    name: 'Spread Shot',
    icon: '💥',
    color: '#f97316',
    description: 'Shoots 3 bullets',
  },
  magnet: {
    name: 'Magnet',
    icon: '🧲',
    color: '#06b6d4',
    description: 'Pulls targets closer',
  },
  shield: {
    name: 'Shield',
    icon: '🛡️',
    color: '#22c55e',
    description: 'Protects from one miss',
  },
  doublepoints: {
    name: 'Double Points',
    icon: '2️⃣',
    color: '#eab308',
    description: 'Double score',
  },
} as const;

// Weapon skins
export const WEAPON_SKINS = {
  default: {
    name: 'Default',
    crosshairColor: '#ef4444',
    muzzleFlashColor: '#fbbf24',
    trailColor: null,
  },
  laser: {
    name: 'Laser',
    crosshairColor: '#22c55e',
    muzzleFlashColor: '#4ade80',
    trailColor: '#22c55e',
  },
  plasma: {
    name: 'Plasma',
    crosshairColor: '#8b5cf6',
    muzzleFlashColor: '#a78bfa',
    trailColor: '#8b5cf6',
  },
  neon: {
    name: 'Neon',
    crosshairColor: '#f0abfc',
    muzzleFlashColor: '#f0abfc',
    trailColor: '#f0abfc',
  },
  retro: {
    name: 'Retro',
    crosshairColor: '#fbbf24',
    muzzleFlashColor: '#fb923c',
    trailColor: null,
  },
  golden: {
    name: 'Golden',
    crosshairColor: '#fcd34d',
    muzzleFlashColor: '#fcd34d',
    trailColor: '#fcd34d',
  },
} as const;

// Color blind palettes
export const COLOR_BLIND_PALETTES = {
  none: {
    hit: '#22c55e',
    miss: '#ef4444',
    bonus: '#eab308',
    danger: '#ef4444',
  },
  protanopia: {
    hit: '#0ea5e9',
    miss: '#eab308',
    bonus: '#8b5cf6',
    danger: '#eab308',
  },
  deuteranopia: {
    hit: '#0ea5e9',
    miss: '#f97316',
    bonus: '#8b5cf6',
    danger: '#f97316',
  },
  tritanopia: {
    hit: '#22c55e',
    miss: '#f43f5e',
    bonus: '#06b6d4',
    danger: '#f43f5e',
  },
} as const;

// Default settings
export const DEFAULT_SETTINGS: GameSettings = {
  soundMode: 'arcade',
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  sensitivity: 1.0,
  leftHandMode: false,
  colorBlindMode: 'none',
  highContrast: false,
  weaponSkin: 'default',
  crosshairStyle: 'default',
  crosshairColor: '#ef4444',
  limitedAmmoEnabled: false,
};

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
    specialRules: { speedRamp: true, shrinkingTargets: true, hasBoss: true },
  },
] as const;

// Achievements
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'First Blood', description: 'Destroy your first target', icon: '🎯', requirement: 1, type: 'kills', unlocked: false, progress: 0 },
  { id: 'sharpshooter', name: 'Sharpshooter', description: 'Destroy 100 targets', icon: '🔫', requirement: 100, type: 'kills', unlocked: false, progress: 0 },
  { id: 'terminator', name: 'Terminator', description: 'Destroy 1000 targets', icon: '🤖', requirement: 1000, type: 'kills', unlocked: false, progress: 0 },
  { id: 'combo_starter', name: 'Combo Starter', description: 'Get a 5x combo', icon: '⚡', requirement: 5, type: 'combo', unlocked: false, progress: 0 },
  { id: 'combo_master', name: 'Combo Master', description: 'Get a 15x combo', icon: '💥', requirement: 15, type: 'combo', unlocked: false, progress: 0 },
  { id: 'combo_legend', name: 'Combo Legend', description: 'Get a 30x combo', icon: '🌟', requirement: 30, type: 'combo', unlocked: false, progress: 0 },
  { id: 'high_scorer', name: 'High Scorer', description: 'Score 10,000 points', icon: '📊', requirement: 10000, type: 'score', unlocked: false, progress: 0 },
  { id: 'score_champion', name: 'Score Champion', description: 'Score 50,000 points', icon: '🏆', requirement: 50000, type: 'score', unlocked: false, progress: 0 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Complete a level with 100% accuracy', icon: '💎', requirement: 100, type: 'accuracy', unlocked: false, progress: 0 },
  { id: 'level_master', name: 'Level Master', description: 'Complete all 10 levels', icon: '🎓', requirement: 10, type: 'level', unlocked: false, progress: 0 },
  { id: 'power_collector', name: 'Power Collector', description: 'Collect 50 power-ups', icon: '🔋', requirement: 50, type: 'powerup', unlocked: false, progress: 0 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Destroy 10 targets in 5 seconds', icon: '⏱️', requirement: 10, type: 'special', unlocked: false, progress: 0 },
  { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat a boss', icon: '👹', requirement: 1, type: 'special', unlocked: false, progress: 0 },
  { id: 'duo_champions', name: 'Duo Champions', description: 'Win a co-op game', icon: '👥', requirement: 1, type: 'special', unlocked: false, progress: 0 },
];

// Daily challenge templates
export const DAILY_CHALLENGE_TEMPLATES = [
  { type: 'score', name: 'Score Hunter', description: 'Score {target} points in a single game', baseTarget: 5000 },
  { type: 'kills', name: 'Target Practice', description: 'Destroy {target} targets', baseTarget: 50 },
  { type: 'combo', name: 'Combo Chain', description: 'Reach a {target}x combo', baseTarget: 10 },
  { type: 'accuracy', name: 'Precision', description: 'Achieve {target}% accuracy in a level', baseTarget: 80 },
  { type: 'time', name: 'Speed Run', description: 'Complete level 1 with {target} seconds remaining', baseTarget: 30 },
  { type: 'special', name: 'Power Up', description: 'Collect {target} power-ups', baseTarget: 5 },
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
  primary: '#ef4444',
  secondary: '#3b82f6',
  success: '#22c55e',
  warning: '#eab308',
  background: '#0f172a',
  text: '#f8fafc',
  muted: '#64748b',
  player1: '#ef4444',
  player2: '#3b82f6',
} as const;
