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
  SHOOT_THRESHOLD: 0.06, // thumb movement threshold
  SHOOT_COOLDOWN: 200, // ms between shots
  AIM_SMOOTHING: 0.6, // higher = more responsive

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
      spawnWeight: 60,
    },
    fast: {
      sizeMultiplier: 0.8,
      speedMultiplier: 2,
      points: 150,
      health: 1,
      spawnWeight: 20,
    },
    small: {
      sizeMultiplier: 0.5,
      speedMultiplier: 1.2,
      points: 200,
      health: 1,
      spawnWeight: 15,
    },
    bonus: {
      sizeMultiplier: 1.2,
      speedMultiplier: 1.5,
      points: 500,
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
