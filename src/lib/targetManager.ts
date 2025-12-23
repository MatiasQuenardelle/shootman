import { Target, TargetType, MovementPattern, LevelConfig } from '@/types';
import { GAME_CONFIG } from '@/constants/game';

let targetIdCounter = 0;

function generateId(): string {
  return `target-${++targetIdCounter}-${Date.now()}`;
}

// Target weights can be overridden by level config
function weightedRandomTargetType(levelConfig?: LevelConfig): TargetType {
  const weights = levelConfig?.targetWeights || {
    normal: GAME_CONFIG.TARGET_TYPES.normal.spawnWeight,
    fast: GAME_CONFIG.TARGET_TYPES.fast.spawnWeight,
    small: GAME_CONFIG.TARGET_TYPES.small.spawnWeight,
    bonus: GAME_CONFIG.TARGET_TYPES.bonus.spawnWeight,
  };

  const entries = Object.entries(weights) as [TargetType, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * total;

  for (const [type, weight] of entries) {
    random -= weight;
    if (random <= 0) return type;
  }

  return 'normal';
}

// Movement weights can be overridden by level config
function weightedRandomMovement(levelConfig?: LevelConfig): MovementPattern {
  const weights = levelConfig?.movementWeights || GAME_CONFIG.MOVEMENT_PATTERNS;
  const patterns = Object.entries(weights) as [MovementPattern, number][];
  const total = patterns.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * total;

  for (const [pattern, weight] of patterns) {
    random -= weight;
    if (random <= 0) return pattern;
  }

  return 'linear';
}

export function createTarget(
  screenWidth: number,
  screenHeight: number,
  difficulty: number,
  levelConfig?: LevelConfig
): Target {
  const type = weightedRandomTargetType(levelConfig);
  const typeConfig = GAME_CONFIG.TARGET_TYPES[type];
  const movementPattern = weightedRandomMovement(levelConfig);

  // Calculate size based on type and difficulty
  const baseSize =
    GAME_CONFIG.TARGET_MIN_SIZE +
    Math.random() * (GAME_CONFIG.TARGET_MAX_SIZE - GAME_CONFIG.TARGET_MIN_SIZE);
  const size = baseSize * typeConfig.sizeMultiplier * (1 - difficulty * 0.1);

  // Calculate speed based on type and difficulty
  const speed =
    GAME_CONFIG.TARGET_BASE_SPEED *
    typeConfig.speedMultiplier *
    (1 + difficulty * GAME_CONFIG.DIFFICULTY_INCREASE_RATE);

  // Random spawn position on edges
  const edge = Math.floor(Math.random() * 4);
  let x: number, y: number;
  let dirX: number, dirY: number;

  switch (edge) {
    case 0: // Top
      x = Math.random() * screenWidth;
      y = -size;
      dirX = (Math.random() - 0.5) * 2;
      dirY = 1;
      break;
    case 1: // Right
      x = screenWidth + size;
      y = Math.random() * screenHeight;
      dirX = -1;
      dirY = (Math.random() - 0.5) * 2;
      break;
    case 2: // Bottom
      x = Math.random() * screenWidth;
      y = screenHeight + size;
      dirX = (Math.random() - 0.5) * 2;
      dirY = -1;
      break;
    case 3: // Left
    default:
      x = -size;
      y = Math.random() * screenHeight;
      dirX = 1;
      dirY = (Math.random() - 0.5) * 2;
      break;
  }

  // Normalize direction
  const mag = Math.sqrt(dirX * dirX + dirY * dirY);
  dirX /= mag;
  dirY /= mag;

  return {
    id: generateId(),
    x,
    y,
    size,
    speed,
    direction: { x: dirX, y: dirY },
    type,
    health: typeConfig.health,
    points: typeConfig.points,
    movementPattern,
    phase: Math.random() * Math.PI * 2,
    spawnTime: Date.now(),
    baseSize: size,
  };
}

export function updateTarget(
  target: Target,
  deltaTime: number,
  time: number
): Target {
  const dt = deltaTime / 16.67; // Normalize to 60fps
  let newX = target.x;
  let newY = target.y;

  switch (target.movementPattern) {
    case 'linear':
      newX += target.direction.x * target.speed * dt;
      newY += target.direction.y * target.speed * dt;
      break;

    case 'sine':
      newX += target.direction.x * target.speed * dt;
      newY += target.direction.y * target.speed * dt;
      // Add sine wave perpendicular to movement direction
      const perpX = -target.direction.y;
      const perpY = target.direction.x;
      const sineOffset = Math.sin(time * 0.005 + target.phase) * 30;
      newX += perpX * sineOffset * 0.1;
      newY += perpY * sineOffset * 0.1;
      break;

    case 'random':
      // Occasionally change direction slightly
      if (Math.random() < 0.02) {
        const angleChange = (Math.random() - 0.5) * 0.5;
        const cos = Math.cos(angleChange);
        const sin = Math.sin(angleChange);
        const newDirX = target.direction.x * cos - target.direction.y * sin;
        const newDirY = target.direction.x * sin + target.direction.y * cos;
        target.direction = { x: newDirX, y: newDirY };
      }
      newX += target.direction.x * target.speed * dt;
      newY += target.direction.y * target.speed * dt;
      break;

    case 'static':
      // Move to center area then stop
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const distToCenter = Math.sqrt(
        Math.pow(target.x - centerX, 2) + Math.pow(target.y - centerY, 2)
      );
      if (distToCenter > 100) {
        newX += target.direction.x * target.speed * dt;
        newY += target.direction.y * target.speed * dt;
      }
      break;
  }

  return { ...target, x: newX, y: newY };
}

export function isTargetOffScreen(
  target: Target,
  screenWidth: number,
  screenHeight: number
): boolean {
  const margin = target.size * 2;
  return (
    target.x < -margin ||
    target.x > screenWidth + margin ||
    target.y < -margin ||
    target.y > screenHeight + margin
  );
}

export function getTargetColor(type: TargetType): string {
  switch (type) {
    case 'normal':
      return '#ef4444'; // red
    case 'fast':
      return '#f97316'; // orange
    case 'small':
      return '#eab308'; // yellow
    case 'bonus':
      return '#22c55e'; // green
    default:
      return '#ef4444';
  }
}
