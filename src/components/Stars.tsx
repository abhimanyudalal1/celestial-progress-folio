import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWindowSize } from '@/hooks/use-window-size';

interface Star {
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  layer: number;
  hue?: number;
  saturation?: number;
  lightness?: number;
  chaosX: number;
  chaosY: number;
  chaosVX: number;
  chaosVY: number;
  /** Precomputed fill for the "colorful" (dark background) mode — built once, never per frame. */
  fill: string;
  /** Draw size on the white sky, where sub-pixel dots all but vanish. See DARK_SIZE_*. */
  darkSize: number;
  /** Top-left of this star's glow sprite inside the atlas (layers 2+ only). */
  atlasX: number;
  atlasY: number;
}

interface StarsProps {
  isAppLoaded?: boolean;
  onSettled?: () => void;
  isInitialLoad?: boolean;
  /** Scales the star count per layer (mobile passes ~0.2 to keep the canvas cheap). */
  densityScale?: number;
  /** Scales individual star size (mobile passes <1 so stars stay visually smaller than planets). */
  sizeScale?: number;
  /** When false the render loop is parked — used while the opaque intro covers the canvas. */
  active?: boolean;
}

// Glow sprites for layers 2-4 are baked into a single atlas texture at startup, so a frame
// costs one drawImage per star instead of createRadialGradient + arc + arc. Cells are 32px
// (16px radius) which is 2x the largest on-screen glow, so downscaling keeps them crisp.
const GLOW_CELL = 32;
const GLOW_R = GLOW_CELL / 2;

// Layer 1 is thousands of sub-pixel dots. Drawing them from a small shared palette instead
// of a unique random colour each lets the canvas keep one fillStyle across long runs of
// stars — indistinguishable at 1px, but it collapses thousands of style changes per frame.
const LAYER1_TINTS = 64;

// A black dot on a white sky loses far more contrast than a white dot on black: at 0.2px
// and 0.16 alpha it is effectively invisible. Dark mode therefore redraws the distant layer
// through a linear remap that lifts the floor while keeping the relative spread, so the
// field still varies rather than turning into uniform pinpricks. Size and alpha only — the
// star count, positions and motion are untouched.
const DARK_SIZE_BASE = 0.7;
const DARK_SIZE_GAIN = 1.3;
const DARK_ALPHA_FLOOR = 0.35;
// Glow-sprite core radius as a fraction of the sprite, for the same reason: the mid and
// close layers have to stay visibly bigger than the enlarged distant ones. (Light mode
// keeps 0.15 — its stars glow additively and already read at the right weight.)
const DARK_CORE_RATIO = 0.32;

// Twinkle is a sine over time; a lookup table avoids ~6k Math.sin calls every frame.
const SIN_STEPS = 2048;
const SIN_TABLE = new Float32Array(SIN_STEPS);
for (let i = 0; i < SIN_STEPS; i++) SIN_TABLE[i] = Math.sin((i / SIN_STEPS) * Math.PI * 2);
const fastSin = (v: number) => SIN_TABLE[((v * (SIN_STEPS / (Math.PI * 2))) | 0) & (SIN_STEPS - 1)];

const Stars = ({
  isAppLoaded = true,
  onSettled,
  isInitialLoad = false,
  densityScale = 1,
  sizeScale = 1,
  active = true,
}: StarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const gravityCenterRef = useRef<{ x: number, y: number } | null>(null);
  const { isDarkMode } = useTheme();
  const dimensions = useWindowSize(); // Debounced resize hook

  const isDarkModeRef = useRef(isDarkMode);
  const activeRef = useRef(active);
  const lastDimensionsRef = useRef({ width: dimensions.width, height: dimensions.height });
  const glowAtlasRef = useRef<{ canvas: HTMLCanvasElement; dark: boolean } | null>(null);

  useEffect(() => {
    isDarkModeRef.current = isDarkMode;
  }, [isDarkMode]);

  const [explosionStarted, setExplosionStarted] = useState(!isInitialLoad);
  const explosionStartedRef = useRef(!isInitialLoad);
  const settleStartTime = useRef<number | null>(null);
  const initialTime = useRef(Date.now());
  const settledCalled = useRef(false);

  // Big Bang delay
  useEffect(() => {
    if (isInitialLoad && !explosionStarted) {
      const timer = setTimeout(() => {
        setExplosionStarted(true);
        explosionStartedRef.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad, explosionStarted]);

  // Start settling when app loads
  useEffect(() => {
    if (isInitialLoad && isAppLoaded && explosionStarted && settleStartTime.current === null) {
      settleStartTime.current = Date.now();
    }
  }, [isAppLoaded, explosionStarted, isInitialLoad]);

  // Parking the loop is a ref flip rather than an effect re-run, so the starfield never
  // regenerates or restarts when visibility toggles.
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const prevWidth = lastDimensionsRef.current.width;
      const prevHeight = lastDimensionsRef.current.height;
      const newWidth = dimensions.width;
      const newHeight = dimensions.height;

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (starsRef.current.length > 0 && (prevWidth !== newWidth || prevHeight !== newHeight)) {
        const scaleX = newWidth / (prevWidth || 1);
        const scaleY = newHeight / (prevHeight || 1);
        starsRef.current.forEach(star => {
          star.x *= scaleX;
          star.y *= scaleY;
          star.targetX *= scaleX;
          star.targetY *= scaleY;
          star.chaosX *= scaleX;
          star.chaosY *= scaleY;
        });
      }

      lastDimensionsRef.current = { width: newWidth, height: newHeight };
    };

    // Generate stars with different layers for parallax effect.
    // Counts are theme-independent: dark mode's visibility problem is contrast, not
    // density, so it is solved by how the distant layer is drawn (see DARK_SIZE_*) rather
    // than by adding stars.
    const generateStars = () => {
      const layers = [
        { count: 2500, sizeRange: [0.2, 0.8], speedRange: [0.02, 0.05], layer: 1 }, // Distant stars (very slow, small)
        { count: 300, sizeRange: [0.8, 1.4], speedRange: [0.05, 0.1], layer: 2 },  // Mid stars
        { count: 100, sizeRange: [0.8, 1.5], speedRange: [0.1, 0.15], layer: 3 },  // Close stars
        { count: 70, sizeRange: [1.6, 2.5], speedRange: [0.15, 0.2], layer: 4 },  // Closest stars
      ];

      // Shared tint palette for the distant layer (see LAYER1_TINTS)
      const tints = Array.from({ length: LAYER1_TINTS }, () => ({
        hue: Math.random() * 360,
        saturation: Math.random() * 30 + 30,
        lightness: Math.random() * 15 + 80,
      }));

      const distant: Star[] = [];
      const near: Star[] = [];

      layers.forEach(layerConfig => {
        const count = Math.max(1, Math.round(layerConfig.count * densityScale));
        for (let i = 0; i < count; i++) {
          // Random color tint - significantly more variety
          const randomVal = Math.random();
          let hue: number | undefined;
          let saturation: number | undefined;
          let lightness: number | undefined;

          // 60% chance of being colored (reduced from 80%)
          if (randomVal > 0.4) {
            if (layerConfig.layer === 1) {
              const tint = tints[(Math.random() * LAYER1_TINTS) | 0];
              hue = tint.hue;
              saturation = tint.saturation;
              lightness = tint.lightness;
            } else {
              hue = Math.random() * 360;
              saturation = Math.random() * 30 + 30; // 30-60% saturation (reduced from 60-100%)
              lightness = Math.random() * 15 + 80; // 80-95% lightness (lighter/whiter)
            }
          }

          // Initial random target positions (where they normally drift)
          const targetX = Math.random() * canvas.width;
          const targetY = Math.random() * canvas.height;

          // Initial chaos vectors (outward explosion)
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 2; // Explosive speed

          const size = (Math.random() * (layerConfig.sizeRange[1] - layerConfig.sizeRange[0]) + layerConfig.sizeRange[0]) * sizeScale;

          const star: Star = {
            targetX,
            targetY,
            x: targetX, // Set dynamically later
            y: targetY, // Set dynamically later
            size,
            // `size` already carries sizeScale; only the floor needs scaling with it
            darkSize: DARK_SIZE_BASE * sizeScale + size * DARK_SIZE_GAIN,
            opacity: Math.random() * 0.6 + 0.4,
            speed: Math.random() * (layerConfig.speedRange[1] - layerConfig.speedRange[0]) + layerConfig.speedRange[0],
            layer: layerConfig.layer,
            hue,
            saturation,
            lightness,
            chaosX: canvas.width / 2, // Start at center
            chaosY: canvas.height / 2, // Start at center
            chaosVX: Math.cos(angle) * speed,
            chaosVY: Math.sin(angle) * speed,
            fill: hue === undefined ? 'white' : `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`,
            atlasX: 0,
            atlasY: 0,
          };

          (layerConfig.layer === 1 ? distant : near).push(star);
        }
      });

      // Grouping the distant layer by colour lets the draw loop reuse one fillStyle across
      // each run. Draw order within a layer of 1px dots has no visual consequence.
      distant.sort((a, b) => (a.fill < b.fill ? -1 : a.fill > b.fill ? 1 : 0));

      starsRef.current = [...distant, ...near];
      glowAtlasRef.current = null;
    };

    // Bake one glow sprite per layer-2+ star into a single atlas canvas.
    const buildGlowAtlas = (dark: boolean) => {
      const glowStars = starsRef.current.filter(s => s.layer > 1);
      const cols = Math.max(1, Math.ceil(Math.sqrt(glowStars.length)));
      const rows = Math.max(1, Math.ceil(glowStars.length / cols));

      const atlas = document.createElement('canvas');
      atlas.width = cols * GLOW_CELL;
      atlas.height = rows * GLOW_CELL;
      const actx = atlas.getContext('2d');
      if (!actx) return;

      glowStars.forEach((star, i) => {
        const ox = (i % cols) * GLOW_CELL;
        const oy = ((i / cols) | 0) * GLOW_CELL;
        star.atlasX = ox;
        star.atlasY = oy;

        // Sprites are baked at full opacity; the per-frame twinkle is applied with
        // globalAlpha, which multiplies through exactly like the old per-star gradient did.
        // Dark mode reads as dark ink on a white sky, where a wide soft halo turns into a
        // grey smudge rather than a glow — so its falloff is tightened by an extra stop
        // that lands the tail near zero at a third of the radius. The presence lost to that
        // tightening is paid back by the solid core below rather than by a wider halo.
        let starFill = 'black';
        let glowStart = 'rgba(0,0,0,0.95)';
        let glowMid = 'rgba(0,0,0,0.45)';
        let glowTail: string | null = 'rgba(0,0,0,0.07)';
        let glowEnd = 'rgba(0,0,0,0)';

        if (!dark) {
          glowTail = null;
          if (star.hue !== undefined) {
            starFill = star.fill;
            glowStart = `hsla(${star.hue}, ${star.saturation}%, 60%, 0.9)`;
            glowMid = `hsla(${star.hue}, ${star.saturation}%, 60%, 0.5)`;
            glowEnd = `hsla(${star.hue}, ${star.saturation}%, 60%, 0)`;
          } else {
            starFill = 'white';
            glowStart = 'rgba(255, 255, 255, 0.9)';
            glowMid = 'rgba(255, 255, 255, 0.5)';
            glowEnd = 'rgba(100, 150, 255, 0)';
          }
        }

        const cx = ox + GLOW_R;
        const cy = oy + GLOW_R;
        const gradient = actx.createRadialGradient(cx, cy, 0, cx, cy, GLOW_R);
        gradient.addColorStop(0, glowStart);
        gradient.addColorStop(0.1, glowMid);
        if (glowTail) gradient.addColorStop(0.35, glowTail);
        gradient.addColorStop(1, glowEnd);
        actx.fillStyle = gradient;
        actx.beginPath();
        actx.arc(cx, cy, GLOW_R, 0, Math.PI * 2);
        actx.fill();

        // Inner bright core. At the light-mode ratio the on-screen core is only 0.6x the
        // star's size in radius, which leaves a mid-layer star smaller than a distant one
        // once dark mode enlarges those — so dark mode roughly doubles it to keep the
        // layers ordered by apparent size.
        actx.beginPath();
        actx.fillStyle = starFill;
        actx.arc(cx, cy, GLOW_R * (dark ? DARK_CORE_RATIO : 0.15), 0, Math.PI * 2);
        actx.fill();
      });

      glowAtlasRef.current = { canvas: atlas, dark };
    };

    // Mouse move handler for parallax effect and gravity detection
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;

      // Check if hovering a planet (or anything with gravity-source)
      const target = e.target as HTMLElement | SVGElement;
      if (target && typeof target.closest === 'function' && target.closest('.gravity-source')) {
        gravityCenterRef.current = { x: e.clientX, y: e.clientY };
      } else {
        gravityCenterRef.current = null;
      }
    };

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // While the opaque intro covers the canvas there is nothing to see, so skip the
      // whole frame and leave the main thread to the intro sweep.
      if (!activeRef.current) return;

      const dark = isDarkModeRef.current;
      if (!glowAtlasRef.current || glowAtlasRef.current.dark !== dark) buildGlowAtlas(dark);
      const atlas = glowAtlasRef.current?.canvas;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Frame-wide values hoisted out of the per-star loop (this used to be two Date.now()
      // calls and five template-string allocations per star, per frame).
      const now = Date.now();
      const width = canvas.width;
      const height = canvas.height;
      const stars = starsRef.current;
      const isSettlingPhase = settleStartTime.current !== null;
      const settleProgress = isSettlingPhase ? Math.min(1, (now - settleStartTime.current!) / 2500) : 0;
      const easeOut = 1 - Math.pow(1 - settleProgress, 3); // easeOutCubic
      const twinklePhase = now * 0.003;
      const preExplosionProgress = Math.min(1, (now - initialTime.current) / 1000);
      const gravity = gravityCenterRef.current;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const darkFill = 'black';

      let allSettled = true;
      let lastFill = '';
      let lastAlpha = -1;
      ctx.fillStyle = '';

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (isInitialLoad) {
          if (!explosionStartedRef.current) {
            // Before explosion, hold at center tightly packed, increasing in size and shaking
            const progress = preExplosionProgress;

            // The cluster slowly expands
            const clusterSpread = 2 + (progress * progress * 30); // starts small, grows quadratically

            // The shaking becomes increasingly violent
            const shakeAmt = progress * progress * progress * 15;
            const shakeX = (Math.random() - 0.5) * shakeAmt;
            const shakeY = (Math.random() - 0.5) * shakeAmt;

            star.x = width / 2 + (Math.random() - 0.5) * clusterSpread + shakeX;
            star.y = height / 2 + (Math.random() - 0.5) * clusterSpread + shakeY;
            allSettled = false;
          } else if (settleProgress < 1) {
            // Exploding / Chaotic phase + Settling phase
            // Apply friction and noise to chaos velocity
            star.chaosVX *= 0.98; // Friction
            star.chaosVY *= 0.98;
            star.chaosVX += (Math.random() - 0.5) * 1.5; // Brownian noise
            star.chaosVY += (Math.random() - 0.5) * 1.5;

            star.chaosX += star.chaosVX;
            star.chaosY += star.chaosVY;

            // Bounce off walls in chaos mode
            if (star.chaosX < 0 || star.chaosX > width) star.chaosVX *= -1;
            if (star.chaosY < 0 || star.chaosY > height) star.chaosVY *= -1;

            // Interpolate from chaos to target
            star.x = star.chaosX + (star.targetX - star.chaosX) * easeOut;
            star.y = star.chaosY + (star.targetY - star.chaosY) * easeOut;
            allSettled = false;
          } else {
            // Fully settled normal behavior
            star.targetX -= star.speed;
            if (star.targetX < -10) star.targetX = width + 10;
            if (star.targetY < -10) star.targetY = height + 10;
            if (star.targetY > height + 10) star.targetY = -10;
            star.x = star.targetX;
            star.y = star.targetY;
          }
        } else {
          // Standard background behavior (no initial load)
          star.targetX -= star.speed;
          if (star.targetX < -10) star.targetX = width + 10;
          if (star.targetY < -10) star.targetY = height + 10;
          if (star.targetY > height + 10) star.targetY = -10;
          star.x = star.targetX;
          star.y = star.targetY;
        }

        // Apply gravitational pull if a planet is hovered
        if (gravity && (!isInitialLoad || isSettlingPhase)) {
          const dx = gravity.x - star.x;
          const dy = gravity.y - star.y;
          const distSq = dx * dx + dy * dy;

          // Influence radius of 150px around the planet
          if (distSq > 1 && distSq < 150 * 150) {
            const dist = Math.sqrt(distSq);
            // Force is stronger closer to the planet (0 to 1)
            const norm = (150 - dist) / 150;
            // Max pull of 0.8px per frame for a subtle but noticeable drift
            const pullAmount = norm * norm * 0.8;

            // Only pull, don't overshoot
            star.targetX += (dx / dist) * pullAmount;
            star.targetY += (dy / dist) * pullAmount;

            // Update immediate position too to avoid parallax lag fighting it
            star.x = star.targetX;
            star.y = star.targetY;
          }
        }

        // Parallax offset based on mouse position and star layer
        const finalX = star.x + mouseX * star.layer * 2;
        const finalY = star.y + mouseY * star.layer * 2;

        // Twinkle effect
        const twinkle = fastSin(twinklePhase + star.x * 0.05) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        if (star.layer > 1) {
          // Pre-baked glow + core sprite, scaled to this star's glow radius
          const glowSize = star.size * 4;
          if (currentOpacity !== lastAlpha) {
            ctx.globalAlpha = currentOpacity;
            lastAlpha = currentOpacity;
          }
          if (atlas) {
            ctx.drawImage(
              atlas,
              star.atlasX, star.atlasY, GLOW_CELL, GLOW_CELL,
              finalX - glowSize, finalY - glowSize, glowSize * 2, glowSize * 2
            );
          }
        } else {
          // Simple drawing for distant stars (Layer 1) - huge performance boost
          const fill = dark ? darkFill : star.fill;
          if (fill !== lastFill) {
            ctx.fillStyle = fill;
            lastFill = fill;
          }
          // On the white sky these are drawn bigger and with a lifted alpha floor, so the
          // faintest ones still register instead of dissolving into the background.
          const size = dark ? star.darkSize : star.size;
          const alpha = dark
            ? DARK_ALPHA_FLOOR + currentOpacity * (1 - DARK_ALPHA_FLOOR)
            : currentOpacity;
          if (alpha !== lastAlpha) {
            ctx.globalAlpha = alpha;
            lastAlpha = alpha;
          }
          ctx.fillRect(finalX - size * 0.5, finalY - size * 0.5, size, size);
        }

        // Sparkle effect for larger stars (reduced frequency)
        if (star.size > 1.5 && Math.random() > 0.995) {
          const sparkleColor = dark
            ? `rgba(0,0,0, ${currentOpacity * 0.6})`
            : star.hue !== undefined
              ? `hsla(${star.hue}, ${star.saturation}%, 80%, ${currentOpacity * 0.8})`
              : `rgba(255, 255, 255, ${currentOpacity * 0.6})`;

          ctx.globalAlpha = 1;
          lastAlpha = 1;
          ctx.beginPath();
          ctx.strokeStyle = sparkleColor;
          ctx.lineWidth = 0.3;

          // Draw cross sparkle
          const sparkleSize = star.size * 3;
          ctx.moveTo(finalX - sparkleSize, finalY);
          ctx.lineTo(finalX + sparkleSize, finalY);
          ctx.moveTo(finalX, finalY - sparkleSize);
          ctx.lineTo(finalX, finalY + sparkleSize);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      if (isInitialLoad && allSettled && !settledCalled.current && settleStartTime.current !== null) {
        settledCalled.current = true;
        if (onSettled) onSettled();
      }
    };

    // Initialize/Update on resize (debounced)
    resizeCanvas();
    if (starsRef.current.length === 0) {
      generateStars();
    }
    animate();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dimensions.width, dimensions.height]);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse at center, #0f1419 0%, #000000 10%)',
          opacity: isDarkMode ? 0 : 1
        }}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'transparent'
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default Stars;
