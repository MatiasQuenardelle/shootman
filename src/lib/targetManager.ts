import { Target, TargetType, MovementPattern, LevelConfig } from '@/types';
import { GAME_CONFIG } from '@/constants/game';

let targetIdCounter = 0;

function generateId(): string {
  return `target-${++targetIdCounter}-${Date.now()}`;
}

// Target weights can be overridden by level config
function weightedRandomTargetType(levelConfig?: LevelConfig): TargetType {
  const defaultWeights = {
    normal: GAME_CONFIG.TARGET_TYPES.normal.spawnWeight,
    fast: GAME_CONFIG.TARGET_TYPES.fast.spawnWeight,
    small: GAME_CONFIG.TARGET_TYPES.small.spawnWeight,
    bonus: GAME_CONFIG.TARGET_TYPES.bonus.spawnWeight,
    ufo: GAME_CONFIG.TARGET_TYPES.ufo.spawnWeight,
    alien: GAME_CONFIG.TARGET_TYPES.alien.spawnWeight,
    meteor: GAME_CONFIG.TARGET_TYPES.meteor.spawnWeight,
    planet: GAME_CONFIG.TARGET_TYPES.planet.spawnWeight,
    explosive: GAME_CONFIG.TARGET_TYPES.explosive.spawnWeight,
    split: GAME_CONFIG.TARGET_TYPES.split.spawnWeight,
    shield: GAME_CONFIG.TARGET_TYPES.shield.spawnWeight,
    decoy: GAME_CONFIG.TARGET_TYPES.decoy.spawnWeight,
    timefreeze: GAME_CONFIG.TARGET_TYPES.timefreeze.spawnWeight,
  };

  const weights = levelConfig?.targetWeights
    ? { ...defaultWeights, ...levelConfig.targetWeights }
    : defaultWeights;

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
  levelConfig?: LevelConfig,
  forceType?: TargetType
): Target {
  const type = forceType || weightedRandomTargetType(levelConfig);
  const typeConfig = GAME_CONFIG.TARGET_TYPES[type] || GAME_CONFIG.TARGET_TYPES.normal;
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

  const target: Target = {
    id: generateId(),
    x,
    y,
    size,
    speed,
    direction: { x: dirX, y: dirY },
    type,
    health: typeConfig.health,
    maxHealth: typeConfig.health,
    points: typeConfig.points,
    movementPattern,
    phase: Math.random() * Math.PI * 2,
    spawnTime: Date.now(),
    baseSize: size,
  };

  // Add special properties based on type
  if (type === 'explosive') {
    target.explosionRadius = (typeConfig as typeof GAME_CONFIG.TARGET_TYPES.explosive).explosionRadius;
  } else if (type === 'split') {
    target.splitOnDestroy = true;
  } else if (type === 'shield') {
    target.shieldActive = true;
  } else if (type === 'decoy') {
    target.isDecoy = true;
  } else if (type === 'timefreeze') {
    target.freezeOnHit = true;
  }

  return target;
}

export function createBossTarget(
  screenWidth: number,
  screenHeight: number
): Target {
  const typeConfig = GAME_CONFIG.TARGET_TYPES.boss;

  return {
    id: generateId(),
    x: screenWidth / 2,
    y: -150,
    size: 150,
    speed: GAME_CONFIG.TARGET_BASE_SPEED * typeConfig.speedMultiplier,
    direction: { x: 0, y: 1 },
    type: 'boss',
    health: typeConfig.health,
    maxHealth: typeConfig.health,
    points: typeConfig.points,
    movementPattern: 'sine',
    phase: 0,
    spawnTime: Date.now(),
    baseSize: 150,
    isBoss: true,
    bossPhase: 1,
  };
}

export function createSplitTargets(
  parentTarget: Target,
  count: number = 3
): Target[] {
  const splitTargets: Target[] = [];
  const angleStep = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const angle = angleStep * i;
    splitTargets.push({
      id: generateId(),
      x: parentTarget.x,
      y: parentTarget.y,
      size: parentTarget.size * 0.5,
      speed: parentTarget.speed * 1.5,
      direction: { x: Math.cos(angle), y: Math.sin(angle) },
      type: 'small',
      health: 1,
      maxHealth: 1,
      points: 50,
      movementPattern: 'linear',
      phase: 0,
      spawnTime: Date.now(),
      baseSize: parentTarget.size * 0.5,
    });
  }

  return splitTargets;
}

export function updateTarget(
  target: Target,
  deltaTime: number,
  time: number,
  magnetActive: boolean = false,
  magnetPosition?: { x: number; y: number }
): Target {
  const dt = deltaTime / 16.67; // Normalize to 60fps
  let newX = target.x;
  let newY = target.y;
  let direction = { ...target.direction };

  // Apply magnet effect
  if (magnetActive && magnetPosition) {
    const dx = magnetPosition.x - target.x;
    const dy = magnetPosition.y - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < GAME_CONFIG.MAGNET_RANGE && dist > 0) {
      const pullStrength = (1 - dist / GAME_CONFIG.MAGNET_RANGE) * 0.5;
      newX += (dx / dist) * pullStrength * dt;
      newY += (dy / dist) * pullStrength * dt;
    }
  }

  switch (target.movementPattern) {
    case 'linear':
      newX += direction.x * target.speed * dt;
      newY += direction.y * target.speed * dt;
      break;

    case 'sine':
      newX += direction.x * target.speed * dt;
      newY += direction.y * target.speed * dt;
      // Add sine wave perpendicular to movement direction
      const perpX = -direction.y;
      const perpY = direction.x;
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
        const newDirX = direction.x * cos - direction.y * sin;
        const newDirY = direction.x * sin + direction.y * cos;
        direction = { x: newDirX, y: newDirY };
      }
      newX += direction.x * target.speed * dt;
      newY += direction.y * target.speed * dt;
      break;

    case 'static':
      // Move to center area then stop
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const distToCenter = Math.sqrt(
        Math.pow(target.x - centerX, 2) + Math.pow(target.y - centerY, 2)
      );
      if (distToCenter > 100) {
        newX += direction.x * target.speed * dt;
        newY += direction.y * target.speed * dt;
      }
      break;

    case 'orbit':
      // Circular movement
      const orbitRadius = 100;
      const orbitSpeed = 0.002;
      const orbitPhase = target.phase + time * orbitSpeed;
      newX = target.x + Math.cos(orbitPhase) * orbitRadius * 0.02;
      newY = target.y + Math.sin(orbitPhase) * orbitRadius * 0.02;
      newX += direction.x * target.speed * dt * 0.5;
      newY += direction.y * target.speed * dt * 0.5;
      break;

    case 'zigzag':
      // Zigzag movement
      newX += direction.x * target.speed * dt;
      newY += direction.y * target.speed * dt;
      if (Math.sin(time * 0.01 + target.phase) > 0.9) {
        direction = { x: direction.x, y: -direction.y };
      }
      break;
  }

  // Boss special behavior
  if (target.isBoss && target.y > 150) {
    // Boss stays near top and moves side to side
    newY = 150;
    direction = { x: Math.sin(time * 0.002) > 0 ? 1 : -1, y: 0 };
    newX += direction.x * target.speed * 2 * dt;

    // Keep boss on screen
    if (newX < 100) {
      newX = 100;
      direction = { x: 1, y: 0 };
    } else if (newX > window.innerWidth - 100) {
      newX = window.innerWidth - 100;
      direction = { x: -1, y: 0 };
    }
  }

  return { ...target, x: newX, y: newY, direction };
}

export function isTargetOffScreen(
  target: Target,
  screenWidth: number,
  screenHeight: number
): boolean {
  if (target.isBoss) return false; // Bosses never escape
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
    case 'ufo':
      return '#8b5cf6'; // purple
    case 'alien':
      return '#06b6d4'; // cyan
    case 'meteor':
      return '#fb923c'; // orange-400
    case 'planet':
      return '#3b82f6'; // blue
    case 'explosive':
      return '#dc2626'; // red-600
    case 'split':
      return '#a855f7'; // purple-500
    case 'shield':
      return '#0ea5e9'; // sky-500
    case 'decoy':
      return '#84cc16'; // lime-500 (friendly looking)
    case 'timefreeze':
      return '#67e8f9'; // cyan-300
    case 'boss':
      return '#7c2d12'; // orange-900
    default:
      return '#ef4444';
  }
}

export function getTargetEmoji(type: TargetType): string {
  switch (type) {
    case 'ufo':
      return '🛸';
    case 'alien':
      return '👽';
    case 'meteor':
      return '☄️';
    case 'planet':
      return '🪐';
    case 'explosive':
      return '💣';
    case 'split':
      return '🔮';
    case 'shield':
      return '🛡️';
    case 'decoy':
      return '😇';
    case 'timefreeze':
      return '❄️';
    case 'boss':
      return '👹';
    default:
      return '';
  }
}

export function getTargetsInExplosionRadius(
  explosionX: number,
  explosionY: number,
  radius: number,
  targets: Target[]
): Target[] {
  return targets.filter((target) => {
    const dx = target.x - explosionX;
    const dy = target.y - explosionY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius + target.size / 2;
  });
}
