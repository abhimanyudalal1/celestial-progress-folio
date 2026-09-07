import * as THREE from "three";
import { stops } from "@/data/milestones";
import { getPlanetAngle } from "@/lib/solar-system-config";

/**
 * 3D SCENE LAYOUT
 * ===============
 * Shared by the renderer (SolarSystem3D) and the scroll timeline (Index), so both
 * agree on where everything is without measuring the DOM. The old 2D tour solved
 * `p*s + t` against live getBoundingClientRect() readings; in 3D the positions are
 * known analytically and the camera just goes there, which is both simpler and the
 * reason the flight can actually feel like flight.
 *
 * Axes: the system lies in the XZ plane with +Y up. The sun is at the origin, and
 * orbit radius grows with time — so flying outward is flying forward through the
 * career, with the sun literally receding behind you.
 */

export const SUN_RADIUS = 9;

/** Distance between consecutive orbits. Large, so transits cover real ground. */
const ORBIT_STEP = 22;
const ORBIT_INNER = 42;

/** planetSize is a viewport fraction in the data; this maps it into world units. */
const PLANET_SIZE_TO_WORLD = 26;

/** Where the held planet sits on screen, leaving the right side clear for the card. */
export const FOCUS_X = 0.32;
export const FOCUS_Y = 0.46;

export const CAMERA_FOV = 55;
export const CAMERA_NEAR = 0.5;
export const CAMERA_FAR = 4000;

/** Orbit radius for a 1-based orbit index. */
export const orbitRadius = (orbitIndex: number): number =>
  ORBIT_INNER + (orbitIndex - 1) * ORBIT_STEP;

/** World position of the stop at `index` (0-based). */
export const planetPosition = (index: number): THREE.Vector3 => {
  const r = orbitRadius(index + 1);
  // Reuse the 2D fan of angles so the path keeps its familiar sweeping shape
  const a = (getPlanetAngle(index + 1) * Math.PI) / 180;
  // A gentle vertical stagger keeps the path from being a flat line and gives the
  // camera something to bank over on each leg.
  const y = Math.sin(index * 1.7) * 5;
  return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
};

/** World radius of the stop at `index`. */
export const planetRadius = (index: number): number =>
  (stops[index]?.planetSize ?? 0.1) * PLANET_SIZE_TO_WORLD;

export const planetPositions = (): THREE.Vector3[] => stops.map((_, i) => planetPosition(i));

export interface CameraPose {
  pos: THREE.Vector3;
  aim: THREE.Vector3;
}

/**
 * Where the camera parks while holding a milestone.
 *
 * It sits *between* the sun and the planet, looking outward — so the sun is behind
 * you and the planet ahead, which is the whole point of the metaphor. The aim point
 * is nudged sideways so the planet lands at FOCUS_X/FOCUS_Y on screen rather than
 * dead centre, keeping the right half of the frame free for the milestone card.
 */
export const dockPose = (index: number, aspect: number): CameraPose => {
  const p = planetPosition(index);
  const r = planetRadius(index);

  // Approach along the sun->planet ray, stopping short of the planet
  const outward = p.clone().normalize();
  const dockDist = r * 7.5;
  const pos = p.clone().sub(outward.clone().multiplyScalar(dockDist));
  pos.y += r * 1.2;

  return { pos, aim: aimOffset(pos, p, aspect, dockDist) };
};

/**
 * Aim point that places `target` at FOCUS_X/FOCUS_Y on screen instead of centre.
 * Looking `lateral` units to the side of the target swings the target the opposite
 * way in frame; the amount is the on-screen offset converted through the frustum
 * at that distance.
 */
export const aimOffset = (
  pos: THREE.Vector3,
  target: THREE.Vector3,
  aspect: number,
  distance: number,
  focusX: number = FOCUS_X,
  focusY: number = FOCUS_Y
): THREE.Vector3 => {
  const forward = target.clone().sub(pos).normalize();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const right = forward.clone().cross(worldUp).normalize();
  const up = right.clone().cross(forward).normalize();

  const tanHalfY = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180);
  const tanHalfX = tanHalfY * aspect;

  const lateral = (0.5 - focusX) * 2 * tanHalfX * distance;
  const vertical = (focusY - 0.5) * 2 * tanHalfY * distance;

  return target
    .clone()
    .add(right.multiplyScalar(lateral))
    .add(up.multiplyScalar(vertical));
};

/**
 * Opening shot: parked on the far side of the sun from the first milestone, looking
 * along the path. The sun sits in frame ahead and the first planet is a distant
 * point beyond it — so the tour opens by launching past the sun and outward, rather
 * than by diving inward from outside the system.
 */
export const departurePose = (aspect: number): CameraPose => {
  const first = planetPosition(0);
  const outward = first.clone().normalize();
  // Far enough back that the sun reads as a body ahead rather than filling the frame
  const pos = outward.clone().multiplyScalar(-(SUN_RADIUS * 8)).setY(SUN_RADIUS * 2.2);
  const aim = first.clone().multiplyScalar(0.3);
  // Composed right of centre: the identity overlay owns the left column here, so
  // the sun and the receding system sit clear of the wordmark rather than under it.
  return { pos, aim: aimOffset(pos, aim, aspect, pos.distanceTo(aim), 0.66, 0.44) };
};

/**
 * Final shot: pulled back and above the whole system so the entire travelled path
 * is legible at once. This is the payoff the outro lands on top of.
 */
export const revealPose = (aspect: number): CameraPose => {
  const last = planetPosition(stops.length - 1);
  const span = Math.max(orbitRadius(stops.length), 1);
  // Sit off the mid-path, high enough that the whole fan of orbits fits the frustum
  const mid = planetPosition(Math.floor((stops.length - 1) / 2)).normalize();
  const pos = mid.multiplyScalar(span * 0.55).setY(span * 1.5);
  const aim = new THREE.Vector3(last.x * 0.35, 0, last.z * 0.35);
  return { pos, aim };
};
