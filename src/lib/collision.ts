import { Target, AimPosition } from '@/types';

/**
 * Check if a point (aim position) is inside a circular target
 */
export function checkHit(aim: AimPosition, target: Target): boolean {
  const dx = aim.x - target.x;
  const dy = aim.y - target.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= target.size / 2;
}

/**
 * Find all targets hit by the aim position
 */
export function findHitTargets(aim: AimPosition, targets: Target[]): Target[] {
  return targets.filter((target) => checkHit(aim, target));
}

/**
 * Find the closest hit target (in case of overlapping targets)
 */
export function findClosestHitTarget(
  aim: AimPosition,
  targets: Target[]
): Target | null {
  const hitTargets = findHitTargets(aim, targets);
  if (hitTargets.length === 0) return null;

  return hitTargets.reduce((closest, current) => {
    const closestDist = Math.sqrt(
      Math.pow(aim.x - closest.x, 2) + Math.pow(aim.y - closest.y, 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(aim.x - current.x, 2) + Math.pow(aim.y - current.y, 2)
    );
    return currentDist < closestDist ? current : closest;
  });
}

/**
 * Calculate distance between two points
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Check if two circles overlap
 */
export function circlesOverlap(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  return distance(x1, y1, x2, y2) < r1 + r2;
}
