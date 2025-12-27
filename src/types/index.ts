// Hand tracking types
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandLandmarks {
  landmarks: HandLandmark[];
}

export interface AimPosition {
  x: number;
  y: number;
}

export interface GestureState {
  isGunShape: boolean;
  isShooting: boolean;
  isReloading: boolean;
  isFist: boolean;
  aimPosition: AimPosition | null;
  confidence: number;
}

// Player types for multiplayer
export interface Player {
  id: 1 | 2;
  score: number;
  lives: number;
  combo: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadProgress: number;
  gestureState: GestureState;
  color: string;
  activePowerUps: ActivePowerUp[];
}

// Power-up types
export type PowerUpType = 'slowmo' | 'rapidfire' | 'spreadshot' | 'magnet' | 'shield' | 'doublepoints';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  size: number;
  spawnTime: number;
  duration: number; // how long it lasts when collected
}

export interface ActivePowerUp {
  type: PowerUpType;
  endTime: number;
  playerId?: 1 | 2;
}

// Game types
export interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: { x: number; y: number };
  type: TargetType;
  health: number;
  maxHealth: number;
  points: number;
  movementPattern: MovementPattern;
  phase: number;
  spawnTime: number;
  baseSize: number;
  shieldActive?: boolean;
  isDecoy?: boolean;
  splitOnDestroy?: boolean;
  explosionRadius?: number;
  freezeOnHit?: boolean;
  isBoss?: boolean;
  bossPhase?: number;
}

export type TargetType =
  | 'normal' | 'fast' | 'small' | 'bonus'
  | 'ufo' | 'alien' | 'meteor' | 'planet'
  | 'explosive' | 'split' | 'shield' | 'decoy' | 'timefreeze'
  | 'boss';

export type MovementPattern = 'linear' | 'sine' | 'random' | 'static' | 'orbit' | 'zigzag';

// Obstacle types
export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'barrier' | 'moving' | 'rotating';
  angle?: number;
  speed?: number;
  direction?: { x: number; y: number };
}

export interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  wave: number;
  combo: number;
  targets: Target[];
  difficulty: number;
  targetsDestroyed: number;
  shotsFired: number;
  currentLevel: number;
  timeRemaining: number;
  // New properties
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  obstacles: Obstacle[];
  globalTimeScale: number; // for slow-mo
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadProgress: number;
  screenShake: number;
  // Two player mode
  gameMode: 'single' | 'coop' | 'versus' | 'duckhunt';
  players?: Player[];
}

// Duck Hunt specific types
export interface DuckHuntState {
  round: number;
  shotsRemaining: number;
  ducksHit: number;
  ducksInRound: number;
  ducksShotThisRound: boolean[];
  roundPhase: 'playing' | 'roundComplete' | 'gameOver' | 'perfect';
  flyAwayTimer: number | null;
}

export interface Duck {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: 'flying' | 'hit' | 'falling' | 'flyingAway';
  color: 'black' | 'red' | 'blue';
  animationFrame: number;
  points: number;
  spawnTime: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver' | 'levelComplete' | 'levelFailed';

// Level system types
export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  duration: number;
  passScore: number;
  threeStarScore: number;
  difficulty: number;
  maxTargets: number;
  spawnInterval: number;
  targetWeights: {
    normal: number;
    fast: number;
    small: number;
    bonus: number;
    ufo: number;
    alien: number;
    meteor: number;
    planet: number;
    explosive?: number;
    split?: number;
    shield?: number;
    decoy?: number;
    timefreeze?: number;
  };
  movementWeights: {
    linear: number;
    sine: number;
    random: number;
    static: number;
  };
  specialRules?: {
    noLivesLoss?: boolean;
    bonusTimePerHit?: number;
    shrinkingTargets?: boolean;
    speedRamp?: boolean;
    invisibleTargets?: boolean;
    hasBoss?: boolean;
    hasObstacles?: boolean;
    powerUpFrequency?: number;
  };
}

export interface LevelResult {
  levelId: number;
  score: number;
  passed: boolean;
  stars: number;
  targetsHit: number;
  accuracy: number;
}

// UI types
export interface ScreenDimensions {
  width: number;
  height: number;
}

export interface HitEffect {
  id: string;
  x: number;
  y: number;
  timestamp: number;
  type?: 'normal' | 'explosive' | 'critical' | 'split';
  color?: string;
}

export interface MuzzleFlash {
  active: boolean;
  x: number;
  y: number;
  timestamp: number;
  playerId?: 1 | 2;
}

// Weapon skins
export type WeaponSkin = 'default' | 'laser' | 'plasma' | 'neon' | 'retro' | 'golden';
export type CrosshairStyle = 'default' | 'dot' | 'circle' | 'triangle' | 'diamond';

// Settings types
export interface GameSettings {
  // Audio
  soundMode: 'arcade' | 'realistic';
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  // Controls
  sensitivity: number;
  leftHandMode: boolean;
  // Accessibility
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrast: boolean;
  // Customization
  weaponSkin: WeaponSkin;
  crosshairStyle: CrosshairStyle;
  crosshairColor: string;
  // Gameplay
  limitedAmmoEnabled: boolean;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'kills' | 'combo' | 'score' | 'accuracy' | 'level' | 'powerup' | 'special';
  unlocked: boolean;
  progress: number;
  unlockedAt?: number;
}

// Daily challenge types
export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  description: string;
  type: 'score' | 'kills' | 'combo' | 'accuracy' | 'time' | 'special';
  target: number;
  reward: number; // bonus score
  completed: boolean;
  progress: number;
}
