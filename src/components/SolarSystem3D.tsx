import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/contexts/ThemeContext";
import { stops } from "@/data/milestones";
import { getSpriteByType, SPRITE_COLS, SPRITE_ROWS, SPRITE_FRAMES } from "@/lib/planet-sprites";
import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  SUN_RADIUS,
  departurePose,
  planetPosition,
  planetRadius,
} from "@/lib/scene-3d";

/**
 * THE FLIGHT
 *
 * A real Three.js scene replacing the SVG orrery. The 2D version was a flat plane
 * tilted 25deg that panned and zoomed; it could never feel like travelling, because
 * nothing was ever actually in front of or behind anything else. Here the camera is
 * a camera: it flies out from the sun through a field of stars toward each planet,
 * and the parallax of near stars streaming past is what sells the speed.
 *
 * Planets are billboarded sprites, so the existing 50x3 flipbook art carries over
 * unchanged (texture.repeat + a stepped texture.offset) and staying round at any
 * viewing angle is free — that was the single hardest thing to fake in CSS 3D.
 *
 * The canvas is transparent: the tuned 2D starfield still renders behind it as the
 * deep background (and still does the warp streaks), while this scene supplies the
 * near-field stars that actually whip past.
 */

/** Camera pose, mutated in place by the scroll timeline and read every frame. */
export interface CameraState {
  px: number; py: number; pz: number;
  ax: number; ay: number; az: number;
}

export const makeCameraState = (aspect: number): CameraState => {
  const d = departurePose(aspect);
  return { px: d.pos.x, py: d.pos.y, pz: d.pos.z, ax: d.aim.x, ay: d.aim.y, az: d.aim.z };
};

interface Props {
  cameraState: React.MutableRefObject<CameraState>;
  onPlanetClick?: (index: number) => void;
  onPlanetHover?: (hovering: boolean) => void;
  /** Fires once the scene is built and the first frame has rendered. */
  onReady?: () => void;
  /** 0-1, revealed length of the travelled path. */
  trailProgress?: React.MutableRefObject<number>;
}

/**
 * Soft radial dot, used for stars and the sun.
 * `core` is where the solid centre ends — small values give a defined disc with a
 * corona, large ones a diffuse glow. The sun needs the former: at 0.4 it rendered
 * as a smudge the size of the screen rather than a body you fly past.
 */
const radialTexture = (inner: string, outer: string, size = 64, core = 0.4) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(core, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const SolarSystem3D = ({ cameraState, onPlanetClick, onPlanetHover, onReady, trailProgress }: Props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  // Callbacks through refs so changing them can never tear down and rebuild the scene
  const clickRef = useRef(onPlanetClick);
  const hoverRef = useRef(onPlanetHover);
  const readyRef = useRef(onReady);
  useEffect(() => { clickRef.current = onPlanetClick; }, [onPlanetClick]);
  useEffect(() => { hoverRef.current = onPlanetHover; }, [onPlanetHover]);
  useEffect(() => { readyRef.current = onReady; }, [onReady]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const dark = isDarkMode; // true = mono/day mode (white sky), false = space mode
    const scene = new THREE.Scene();

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, CAMERA_NEAR, CAMERA_FAR);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // the 2D starfield shows through as the deep background
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    // Capped: this scene is sprite-heavy and gains nothing visible above 2x
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(x: T) => { disposables.push(x); return x; };

    // ---- Sun ---------------------------------------------------------------
    // A glow sprite rather than geometry: it is a light source in the fiction, and
    // a billboard reads better than a lit sphere with no other lights in the scene.
    const sunTex = track(
      dark
        ? radialTexture("rgba(16,16,16,1)", "rgba(16,16,16,0)", 128, 0.26)
        : radialTexture("rgba(255,238,180,1)", "rgba(255,140,30,0)", 128, 0.2)
    );
    const sunMat = track(new THREE.SpriteMaterial({
      map: sunTex,
      transparent: true,
      opacity: dark ? 0.9 : 1,
      depthWrite: false,
      blending: dark ? THREE.NormalBlending : THREE.AdditiveBlending,
    }));
    const sun = new THREE.Sprite(sunMat);
    sun.scale.setScalar(SUN_RADIUS * 2.3);
    scene.add(sun);

    // ---- Orbits ------------------------------------------------------------
    const orbitMat = track(new THREE.LineDashedMaterial({
      color: dark ? 0x000000 : 0xffffff,
      transparent: true,
      opacity: dark ? 0.28 : 0.3,
      dashSize: 2.4,
      gapSize: 3.6,
    }));

    stops.forEach((_, i) => {
      const p = planetPosition(i);
      const r = Math.hypot(p.x, p.z);
      const pts: THREE.Vector3[] = [];
      for (let a = 0; a <= 128; a++) {
        const th = (a / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(th) * r, p.y, Math.sin(th) * r));
      }
      const g = track(new THREE.BufferGeometry().setFromPoints(pts));
      const line = new THREE.Line(g, orbitMat);
      // Required for LineDashedMaterial — without it the dashes never appear
      line.computeLineDistances();
      scene.add(line);
    });

    // ---- Planets -----------------------------------------------------------
    // Sprites are billboards, so they face the camera from every angle for free.
    const loader = new THREE.TextureLoader();
    const planetSprites: { sprite: THREE.Sprite; tex: THREE.Texture; fps: number }[] = [];

    stops.forEach((m, i) => {
      const url = getSpriteByType(m.planetType, dark);
      if (!url) return;

      const tex = track(loader.load(url));
      tex.colorSpace = THREE.SRGBColorSpace;
      // One frame of the 50x3 atlas
      tex.repeat.set(1 / SPRITE_COLS, 1 / SPRITE_ROWS);
      tex.offset.set(0, 1 - 1 / SPRITE_ROWS);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;

      const mat = track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      const sprite = new THREE.Sprite(mat);
      const r = planetRadius(i);
      sprite.scale.setScalar(r * 2);
      sprite.position.copy(planetPosition(i));
      sprite.userData.index = i;
      scene.add(sprite);

      // Later planets turn fractionally slower; floored so none ever stalls
      planetSprites.push({ sprite, tex, fps: Math.max(0.6, 3.0 - i * 0.3) });
    });

    // ---- The path ----------------------------------------------------------
    // Resampled densely so setDrawRange can reveal it smoothly as the camera travels.
    const anchors = stops.map((_, i) => planetPosition(i));
    const trailPts: THREE.Vector3[] = [];
    const SEG = 60;
    for (let i = 0; i < anchors.length - 1; i++) {
      for (let s = 0; s < SEG; s++) {
        trailPts.push(anchors[i].clone().lerp(anchors[i + 1], s / SEG));
      }
    }
    if (anchors.length) trailPts.push(anchors[anchors.length - 1].clone());

    const trailGeo = track(new THREE.BufferGeometry().setFromPoints(trailPts));
    const trailMat = track(new THREE.LineBasicMaterial({
      color: dark ? 0x000000 : 0xffffff,
      transparent: true,
      opacity: dark ? 0.5 : 0.6,
    }));
    const trail = new THREE.Line(trailGeo, trailMat);
    trail.frustumCulled = false;
    trailGeo.setDrawRange(0, 0);
    scene.add(trail);

    // ---- Stars -------------------------------------------------------------
    // The near field. These sit inside the volume the camera flies through, so they
    // stream past with true parallax — this, not the geometry, is what makes the
    // transit read as speed.
    const starTex = track(
      dark ? radialTexture("rgba(0,0,0,0.9)", "rgba(0,0,0,0)", 32)
           : radialTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)", 32)
    );

    const makeField = (count: number, rMin: number, rMax: number, size: number, opacity: number) => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        // Uniform direction, radius biased outward so the field doesn't clump at centre
        const u = Math.random() * 2 - 1;
        const th = Math.random() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        const r = rMin + (rMax - rMin) * Math.cbrt(Math.random());
        pos[i * 3] = Math.cos(th) * s * r;
        pos[i * 3 + 1] = u * r * 0.55; // flattened, so the system reads as a disc
        pos[i * 3 + 2] = Math.sin(th) * s * r;
      }
      const g = track(new THREE.BufferGeometry());
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const m = track(new THREE.PointsMaterial({
        map: starTex,
        size,
        sizeAttenuation: true,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: dark ? THREE.NormalBlending : THREE.AdditiveBlending,
      }));
      const pts = new THREE.Points(g, m);
      pts.frustumCulled = false;
      scene.add(pts);
      return pts;
    };

    makeField(2600, 25, 240, 1.5, dark ? 0.55 : 0.85); // near — the speed cue
    makeField(1800, 300, 900, 6, dark ? 0.35 : 0.5);   // far — depth backdrop

    // ---- Picking -----------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered = -1;

    const pick = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(planetSprites.map(p => p.sprite), false);
      return hits.length ? (hits[0].object.userData.index as number) : -1;
    };

    const onMove = (e: PointerEvent) => {
      const idx = pick(e);
      if (idx !== hovered) {
        hovered = idx;
        renderer.domElement.style.cursor = idx >= 0 ? "pointer" : "";
        hoverRef.current?.(idx >= 0);
      }
    };
    const onClick = (e: PointerEvent) => {
      const idx = pick(e);
      if (idx >= 0) clickRef.current?.(idx);
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerdown", onClick);

    // ---- Loop --------------------------------------------------------------
    const aimVec = new THREE.Vector3();
    const start = Date.now();
    const lastFrame: number[] = [];
    let raf = 0;
    let announced = false;

    const tick = () => {
      raf = requestAnimationFrame(tick);

      const cs = cameraState.current;
      camera.position.set(cs.px, cs.py, cs.pz);
      aimVec.set(cs.ax, cs.ay, cs.az);
      camera.lookAt(aimVec);

      // Step each planet's flipbook. Only the texture offset changes — no upload.
      const elapsed = (Date.now() - start) / 1000;
      for (let i = 0; i < planetSprites.length; i++) {
        const { tex, fps } = planetSprites[i];
        const frame = Math.floor(elapsed * fps) % SPRITE_FRAMES;
        if (lastFrame[i] === frame) continue;
        lastFrame[i] = frame;
        const col = frame % SPRITE_COLS;
        const row = Math.floor(frame / SPRITE_COLS);
        // UV origin is bottom-left, atlas rows run top-down
        tex.offset.set(col / SPRITE_COLS, 1 - (row + 1) / SPRITE_ROWS);
      }

      if (trailProgress) {
        const n = Math.round(THREE.MathUtils.clamp(trailProgress.current, 0, 1) * trailPts.length);
        trailGeo.setDrawRange(0, n);
      }

      renderer.render(scene, camera);

      if (!announced) {
        announced = true;
        readyRef.current?.();
      }
    };
    tick();

    // ---- Resize ------------------------------------------------------------
    const onResize = () => {
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onClick);
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [isDarkMode, cameraState, trailProgress]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
};

export default SolarSystem3D;
