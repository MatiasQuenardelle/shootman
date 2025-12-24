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
  aimPosition: AimPosition | null;
  confidence: number;
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
  points: number;
  movementPattern: MovementPattern;
  phase: number;
  spawnTime: number; // for shrinking/fading effects
  baseSize: number; // original size before shrinking
}

export type TargetType = 'normal' | 'fast' | 'small' | 'bonus' | 'ufo' | 'alien' | 'meteor' | 'planet';

export type MovementPattern = 'linear' | 'sine' | 'random' | 'static';

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
  timeRemaining: number; // seconds
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver' | 'levelComplete' | 'levelFailed';

// Level system types
export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  duration: number; // seconds
  passScore: number;
  threeStarScore: number;
  difficulty: number;
  maxTargets: number;
  spawnInterval: number; // ms
  targetWeights: {
    normal: number;
    fast: number;
    small: number;
    bonus: number;
    ufo: number;
    alien: number;
    meteor: number;
    planet: number;
  };
  movementWeights: {
    linear: number;
    sine: number;
    random: number;
    static: number;
  };
  specialRules?: {
    noLivesLoss?: boolean; // targets don't take lives when escaping
    bonusTimePerHit?: number; // seconds added per hit
    shrinkingTargets?: boolean; // targets shrink over time
    speedRamp?: boolean; // targets speed up as time passes
    invisibleTargets?: boolean; // targets fade in/out
  };
}

export interface LevelResult {
  levelId: number;
  score: number;
  passed: boolean;
  stars: number; // 0-3
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
}

export interface MuzzleFlash {
  active: boolean;
  x: number;
  y: number;
  timestamp: number;
}
