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
}

export type TargetType = 'normal' | 'fast' | 'small' | 'bonus';

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
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

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
