import * as THREE from "three";
import { stops } from "@/data/milestones";

/**
 * 3D SCENE LAYOUT
 * ===============
 * Shared by the renderer (SolarSystem3D) and the scroll timeline (Index), so both
 * agree on where everything is without measuring the DOM.
 *
 * Axes: the system lies in the XZ plane with +Y up. The sun is at the origin, and
 * orbit radius grows with time — so flying outward is flying forward through the
 * career, with the sun receding behind you.
 *
 * The angular fan is defined here rather than reusing `getPlanetAngle` from
 * solar-system-config: that function is still read by TransitionController for the
 * /grid-view overlay, and narrowing its spread would silently move that too.
 */

const SUN_RADIUS_VALUE = 5;
export const SUN_RADIUS = SUN_RADIUS_VALUE;

/**
 * Layout is deliberately compact. The first pass fanned the stops across 86deg with
 * orbits out to r=130, which put stops 4 and 5 at 54deg and 73deg off the view axis
 * against a 39.8deg half-frustum — they were simply off-screen in the opening shot,
 * roughly 4x outside the frame. A 40deg fan with tighter orbits fits every stop with
 * margin at 4:3 (the binding aspect ratio) and leaves room to draw them much larger.
 */
const ANGLE_START = 302;
const ANGLE_SPAN = 40;
// ORBIT_INNER must leave room for the innermost dock, which sits between the sun and
// the planet at `planetRadius * DOCK_DISTANCE`. At 36 the first dock landed 4.1 units
// from the origin — inside a sun of radius 9 — and the camera flew through the star.
const ORBIT_INNER = 50;
const ORBIT_STEP = 60;

/**
 * Dock standoff, in planet radii.
 *
 * Counter-intuitively, pulling this *in* is what uncrowds the frame. Neighbouring
 * planets sit at a fixed distance in world space, so moving the camera closer to the
 * held planet swings them further off-axis and out of shot — while also making the
 * held planet larger. At 7.5 three planets were prominent at once; at 4.5 it is at
 * most two, and the held planet fills ~40% of the frame height instead of ~25%.
 */
const DOCK_DISTANCE = 4.5;

/**
 * Vertical offset per stop. Milestones must not sit on one flat arc — that is what
 * put three of them in frame together, and what made the flight feel like a straight
 * walk-in. Consecutive entries always cross zero, so no two neighbours share a
 * height, but the amplitudes vary so the path is not a mechanical sawtooth. The
 * camera now climbs and dives between milestones, which is most of the trajectory's
 * character.
 */
const Y_STAGGER = [-32, 24, -30, 36, -20];

/** No camera waypoint may come closer than this to the sun's surface. */
const SUN_KEEPOUT = SUN_RADIUS_VALUE * 1.8;

/** planetSize is a viewport fraction in the data; this maps it into world units. */
const PLANET_SIZE_TO_WORLD = 38;

/** Where the held planet sits on screen, leaving the right side clear for the card. */
export const FOCUS_X = 0.32;
export const FOCUS_Y = 0.46;

export const CAMERA_FOV = 55;
export const CAMERA_NEAR = 0.5;
export const CAMERA_FAR = 4000;

/** How far ahead along the curve the camera looks while in transit. */
const LOOK_AHEAD = 0.06;

/**
 * THE SPIRAL
 *
 * The camera corkscrews around its own line of travel instead of sliding straight
 * down it. Amplitude scales with (1 - aimBlend): full mid-transit, exactly zero once
 * the camera has swung onto a milestone, so cards are never read from a rolling
 * camera.
 *
 * Every leg spirals *differently* — its own width, rate, handedness, starting phase
 * and wobble. A fixed helix reads as machinery after the second leg; varying them is
 * what keeps the flight feeling unpredictable.
 *
 * The variation is seeded, not live-random: the camera pose has to be a pure function
 * of scroll position. Anything sampled per frame would jitter, and scrubbing back up
 * would not retrace the same path. `legSpiral` hashes the leg index instead, so it is
 * stable across reloads and identical in both directions.
 */
export const HELIX_RADIUS = 6.5;
export const HELIX_TURNS = 3;
/** Peak roll (radians) the spiral rocks the horizon by, before per-leg scaling. */
export const HELIX_ROLL_FOLLOW = 0;

/** Deterministic [0,1) from an integer. Standard hash-sine; no allocation. */
const hash01 = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export interface LegSpiral {
  radius: number;
  turns: number;
  dir: number;
  phase: number;
  wobAmp: number;
  wobFreq: number;
  rollScale: number;
}

/** The spiral this leg flies. Seeded from the leg index — see the note above. */
export const legSpiral = (leg: number): LegSpiral => {
  const h = (k: number) => hash01(leg * 7 + k);
  return {
    radius: 0.6 + h(1) * 0.95,          // 0.60 - 1.55 x HELIX_RADIUS
    turns: 0.55 + h(2) * 1.5,           // half a turn to two turns per leg
    dir: h(3) < 0.5 ? -1 : 1,           // handedness flips
    phase: h(4) * Math.PI * 2,          // enters the spiral at a different point
    wobAmp: 0.18 + h(5) * 0.42,         // breaks the circle into something wandering
    wobFreq: 0.29 + h(6) * 0.53,        // incommensurate, so it never quite repeats
    rollScale: 0.55 + h(7) * 0.75,
  };
};

/**
 * Which leg of the flight `u` falls in. Leg i is the run up to dock i; the index past
 * the last dock is the final climb to the reveal. Parameters change only at docks,
 * where spiral amplitude is already zero, so switching them is discontinuity-free.
 */
export const legIndexAt = (path: FlightPath, u: number): number => {
  for (let i = 0; i < path.dockU.length; i++) if (u <= path.dockU[i]) return i;
  return path.dockU.length;
};

const count = () => Math.max(1, stops.length);

/** Orbit radius for a 1-based orbit index. */
export const orbitRadius = (orbitIndex: number): number =>
  ORBIT_INNER + (orbitIndex - 1) * ORBIT_STEP;

/** Angle of the stop at `index` (0-based), spreading all stops across the fan. */
const planetAngle = (index: number): number => {
  const n = count();
  return ANGLE_START + (n > 1 ? (index / (n - 1)) * ANGLE_SPAN : 0);
};

/** World position of the stop at `index` (0-based). */
export const planetPosition = (index: number): THREE.Vector3 => {
  const r = orbitRadius(index + 1);
  const a = (planetAngle(index) * Math.PI) / 180;
  const y = Y_STAGGER[index % Y_STAGGER.length];
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

const WORLD_UP = new THREE.Vector3(0, 1, 0);

/**
 * Aim point that places `target` at focusX/focusY on screen instead of centre.
 * Looking to the side of the target swings the target the opposite way in frame; the
 * amount is the on-screen offset converted through the frustum at that distance.
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
  const right = forward.clone().cross(WORLD_UP).normalize();
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
 * Where the camera parks on arriving at a milestone. It sits between the sun and the
 * planet looking outward, so the sun is behind you and the planet ahead.
 */
export const dockPosition = (index: number): THREE.Vector3 => {
  const p = planetPosition(index);
  const r = planetRadius(index);
  const outward = p.clone().normalize();
  const pos = p.clone().sub(outward.clone().multiplyScalar(r * DOCK_DISTANCE));
  pos.y += r * 1.2;

  // Safety net for the innermost stop: if the standoff would put the camera inside
  // the sun, slide it back out along the same ray. Layout constants are tuned so this
  // does not fire, but it keeps a future milestone or size change from silently
  // flying the camera through the star.
  const fromSun = Math.hypot(pos.x, pos.z);
  if (fromSun < SUN_KEEPOUT) {
    const scale = SUN_KEEPOUT / Math.max(fromSun, 0.001);
    pos.x *= scale;
    pos.z *= scale;
  }
  return pos;
};

/**
 * Where the slow drift ends. The camera keeps easing along a short arc around the
 * held planet while its card is up, so the flight never comes to a dead stop — that
 * stop-start rhythm is what made the first pass feel like five separate moves.
 * Framing survives the drift because the hold aim is recomputed from the camera's
 * live position every frame.
 */
export const driftEndPosition = (index: number): THREE.Vector3 => {
  const planet = planetPosition(index);
  const from = dockPosition(index).sub(planet);
  const dir = index % 2 === 0 ? 1 : -1;
  from.applyAxisAngle(WORLD_UP, (16 * Math.PI) / 180 * dir);
  from.y += planetRadius(index) * 0.35 * dir;
  return planet.clone().add(from);
};

/** Opening shot: near the sun, looking out along the path with every stop in frame. */
/**
 * Where the sun sits in the opening shot, as screen fractions. Composed low and
 * right of centre, so the identity overlay owns the upper left and the system arcs
 * up and away above the star.
 */
export const SUN_FOCUS_X = 0.57;
export const SUN_FOCUS_Y = 0.82;
/** Sun diameter in the opening shot, as a fraction of frame height. */
export const SUN_FRAME_FRACTION = 0.656;

export const departurePose = (aspect: number): CameraPose => {
  const first = planetPosition(0);
  const outward = first.clone().normalize();
  // Raised well above the orbital plane. Dropping the sun to 0.82 pushes everything
  // else down the frame with it, and this is the height at which the whole fan still
  // fits — verified against 4:3, which is the binding aspect ratio.
  const pos = outward.clone().multiplyScalar(-(SUN_RADIUS * 10)).setY(SUN_RADIUS * 4.6);
  // Aimed at the sun itself rather than at a point along the path: that is the only
  // way to land the star at an exact spot on screen.
  const target = new THREE.Vector3(0, 0, 0);
  return {
    pos,
    aim: aimOffset(pos, target, aspect, pos.distanceTo(target), SUN_FOCUS_X, SUN_FOCUS_Y),
  };
};

/**
 * Sprite scale that makes the sun the requested fraction of frame height in the
 * opening shot. Derived from the camera distance rather than hardcoded, so moving
 * the camera can never silently change how big the star reads.
 */
export const sunSpriteScale = (aspect: number): number => {
  const d = departurePose(aspect).pos.length();
  const tanHalfY = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180);
  return SUN_FRAME_FRACTION * 2 * d * tanHalfY;
};

/** Final shot: pulled back and above, so the whole travelled path reads at once. */
export const revealPose = (aspect: number): CameraPose => {
  const last = planetPosition(stops.length - 1);
  const span = Math.max(orbitRadius(count()), 1);
  const mid = planetPosition(Math.floor((stops.length - 1) / 2)).normalize();
  const pos = mid.multiplyScalar(span * 0.55).setY(span * 1.5);
  const aim = new THREE.Vector3(last.x * 0.35, 0, last.z * 0.35);
  return { pos, aim };
};

export interface FlightPath {
  curve: THREE.CatmullRomCurve3;
  /** Arc-length parameter (0-1) of each dock, indexed by stop. */
  dockU: number[];
  /** Arc-length parameter of the end of each hold drift. */
  driftU: number[];
}

/**
 * The whole flight as one continuous curve.
 *
 * The first pass ran five separate straight-line tweens with identical easing, which
 * is exactly why it read as repetitive: every leg was the same move. Here the legs
 * are one spline, and each approach point is pushed out perpendicular to its leg on
 * *alternating* sides (with an alternating vertical component), so consecutive legs
 * curve opposite ways and the path becomes a banked S rather than a polyline.
 */
export const flightPath = (aspect: number): FlightPath => {
  const n = stops.length;
  const points: THREE.Vector3[] = [];
  const dockIdx: number[] = [];
  const driftIdx: number[] = [];

  const start = departurePose(aspect).pos;
  points.push(start);

  let prev = start;
  for (let i = 0; i < n; i++) {
    const dock = dockPosition(i);
    const leg = dock.clone().sub(prev);
    const legLen = leg.length();
    const dir = leg.clone().normalize();
    const side = i % 2 === 0 ? 1 : -1;
    const right = dir.clone().cross(WORLD_UP).normalize();

    // Bow the leg out to one side, alternating, so no two legs feel the same.
    // Kept modest: the milestones' own vertical stagger already makes the path a 3D
    // zigzag, and stacking a large lateral bow on top of that overshoots the dock and
    // is what made arrivals feel like they were swinging past rather than landing.
    const approach = prev
      .clone()
      .lerp(dock, 0.58)
      .add(right.multiplyScalar(legLen * 0.12 * side));

    points.push(approach);
    dockIdx.push(points.length);
    points.push(dock);

    const drift = driftEndPosition(i);
    driftIdx.push(points.length);
    points.push(drift);
    prev = drift;
  }

  points.push(revealPose(aspect).pos);

  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.5);
  // Arc-length table, so getPointAt() advances at a predictable rate
  curve.arcLengthDivisions = 2000;
  curve.updateArcLengths();

  // Map each waypoint to its arc-length parameter by sampling. The control points
  // are in curve-parameter space, which is not uniform; the timeline needs u.
  const SAMPLES = 2000;
  const nearestU = (target: THREE.Vector3) => {
    let bestU = 0;
    let bestD = Infinity;
    const p = new THREE.Vector3();
    for (let s = 0; s <= SAMPLES; s++) {
      const u = s / SAMPLES;
      curve.getPointAt(u, p);
      const d = p.distanceToSquared(target);
      if (d < bestD) {
        bestD = d;
        bestU = u;
      }
    }
    return bestU;
  };

  return {
    curve,
    dockU: dockIdx.map(i => nearestU(points[i])),
    driftU: driftIdx.map(i => nearestU(points[i])),
  };
};

/**
 * Resolve the camera's position and aim for a point along the flight.
 *
 * `aimBlend` is the fix for the flight reading as a side-tracking shot: at 0 the
 * camera looks along its own direction of travel, which centres the vanishing point
 * and makes the starfield stream the same way the planets do. At 1 it looks at the
 * held milestone through the focus offset so the card column stays clear. In transit
 * it is 0; it swings to 1 only on arrival.
 */
const _tan = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();

/**
 * Perpendicular frame around the curve's tangent at `u`, used to spiral the camera
 * around its own direction of travel. Falls back to the Z axis where the tangent is
 * near-vertical and the world-up cross product would collapse.
 */
const tangentFrame = (path: FlightPath, u: number) => {
  path.curve.getTangentAt(THREE.MathUtils.clamp(u, 0, 1), _tan).normalize();
  const ref = Math.abs(_tan.y) > 0.95 ? new THREE.Vector3(0, 0, 1) : WORLD_UP;
  _right.copy(_tan).cross(ref).normalize();
  _up.copy(_right).cross(_tan).normalize();
  return { tangent: _tan, right: _right, up: _up };
};

/** Phase of the spiral at `u` for a given leg. Shared by the offset and the roll. */
export const helixPhase = (u: number, sp: LegSpiral): number =>
  sp.phase + u * Math.PI * 2 * HELIX_TURNS * sp.turns * sp.dir;

/** The slow secondary wobble that keeps the spiral from being a clean circle. */
const helixWobble = (u: number, sp: LegSpiral): number =>
  Math.sin(u * Math.PI * 2 * HELIX_TURNS * sp.wobFreq + sp.phase * 1.7) * sp.wobAmp;

export const resolveCamera = (
  path: FlightPath,
  u: number,
  aimBlend: number,
  holdIndex: number,
  explicitAim: THREE.Vector3,
  aspect: number,
  outPos: THREE.Vector3,
  outAim: THREE.Vector3
): void => {
  const t = THREE.MathUtils.clamp(u, 0, 1);
  path.curve.getPointAt(t, outPos);

  // Spiral: displace around the tangent, at full strength only while in transit
  const active = 1 - THREE.MathUtils.clamp(aimBlend, 0, 1);
  if (active > 0.001) {
    const sp = legSpiral(legIndexAt(path, t));
    const amp = active * HELIX_RADIUS * sp.radius;
    const { right, up } = tangentFrame(path, t);
    const phase = helixPhase(t, sp);
    const wob = helixWobble(t, sp);
    // The wobble is added unevenly to the two axes so the cross-section is a drifting
    // ellipse rather than a circle — that asymmetry is most of the "uncertainty".
    outPos.addScaledVector(right, (Math.cos(phase) + wob) * amp);
    outPos.addScaledVector(up, (Math.sin(phase) - wob * 0.7) * amp);
  }

  // Travel-direction aim: a point further along the curve
  path.curve.getPointAt(Math.min(1, t + LOOK_AHEAD), outAim);
  // Near the very end there is no curve left to look down, so extend the tangent
  if (t + LOOK_AHEAD > 1) {
    const tan = path.curve.getTangentAt(1).multiplyScalar(LOOK_AHEAD * 100);
    outAim.copy(path.curve.getPointAt(1)).add(tan);
  }

  const blend = THREE.MathUtils.clamp(aimBlend, 0, 1);
  if (blend <= 0) return;

  let target: THREE.Vector3;
  if (holdIndex >= 0 && holdIndex < stops.length) {
    const planet = planetPosition(holdIndex);
    target = aimOffset(outPos, planet, aspect, outPos.distanceTo(planet));
  } else {
    target = explicitAim;
  }
  outAim.lerp(target, blend);
};

/**
 * Roll angle (radians): how sharply the curve is turning, plus the corkscrew's own
 * rotation so the horizon travels with the spiral instead of the camera merely
 * sliding around a circle while staying level.
 *
 * Both terms scale with (1 - aimBlend), so roll is exactly zero at every dock.
 */
export const bankAngle = (path: FlightPath, u: number, aimBlend = 0): number => {
  const t = THREE.MathUtils.clamp(u, 0.001, 0.999);
  const d = 0.01;
  const a = path.curve.getTangentAt(Math.max(0, t - d));
  const b = path.curve.getTangentAt(Math.min(1, t + d));
  // Signed turn about the world up axis
  const cross = a.clone().cross(b);
  const sign = Math.sign(cross.y) || 1;
  const bank = THREE.MathUtils.clamp(a.angleTo(b) * sign * 3.2, -0.21, 0.21); // ~12deg cap

  const active = 1 - THREE.MathUtils.clamp(aimBlend, 0, 1);
  // Rocks with the spiral rather than tracking its raw phase. The phase accumulates
  // to tens of radians across the flight, and scaling that by `active` at a dock would
  // unwind the horizon through several full rotations on the way to level. Taking
  // its sine keeps the roll bounded and periodic, so it fades to zero cleanly.
  const sp = legSpiral(legIndexAt(path, t));
  const spin = Math.sin(helixPhase(t, sp)) * HELIX_ROLL_FOLLOW * sp.rollScale;
  return (bank + spin) * active;
};
