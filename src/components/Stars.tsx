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
}

interface StarsProps {
  isAppLoaded?: boolean;
  onSettled?: () => void;
  isInitialLoad?: boolean;
}

const Stars = ({ isAppLoaded = true, onSettled, isInitialLoad = false }: StarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const gravityCenterRef = useRef<{ x: number, y: number } | null>(null);
  const { isDarkMode } = useTheme();
  const dimensions = useWindowSize(); // Debounced resize hook

  const [explosionStarted, setExplosionStarted] = useState(!isInitialLoad);
  const explosionStartedRef = useRef(!isInitialLoad);
  const settleStartTime = useRef<number | null>(null);
  const initialTime = useRef(Date.now());
  const settledCalled = useRef(false);

  // Big Bang delay
  useEffect(() => {
    if (isInitialLoad && !explosionStarted) {
      const timer = setTimeout(() => {
        console.log('[Stars] Explosion started');
        setExplosionStarted(true);
        explosionStartedRef.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad, explosionStarted]);

  // Start settling when app loads
  useEffect(() => {
    if (isInitialLoad && isAppLoaded && explosionStarted && settleStartTime.current === null) {
      console.log('[Stars] Starting settle phase');
      settleStartTime.current = Date.now();
    }
  }, [isAppLoaded, explosionStarted, isInitialLoad]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
    };

    // Generate stars with different layers for parallax effect
    const generateStars = () => {
      const stars: Star[] = [];
      const layers = [
        { count: 1000, sizeRange: [0.2, 0.8], speedRange: [0.02, 0.05], layer: 1 }, // Distant stars (very slow, small)
        { count: 100, sizeRange: [0.5, 1.2], speedRange: [0.05, 0.1], layer: 2 },  // Mid stars
        { count: 100, sizeRange: [0.8, 1.5], speedRange: [0.1, 0.15], layer: 3 },  // Close stars
        { count: 10, sizeRange: [1.2, 2.0], speedRange: [0.15, 0.2], layer: 4 },  // Closest stars
      ];

      layers.forEach(layerConfig => {
        for (let i = 0; i < layerConfig.count; i++) {
          // Random color tint - significantly more variety
          const randomVal = Math.random();
          let hue, saturation, lightness;

          // 60% chance of being colored (reduced from 80%)
          if (randomVal > 0.4) {
            hue = Math.random() * 360;
            saturation = Math.random() * 30 + 30; // 30-60% saturation (reduced from 60-100%)
            lightness = Math.random() * 15 + 80; // 80-95% lightness (lighter/whiter)
          }

          // Initial random target positions (where they normally drift)
          const targetX = Math.random() * canvas.width;
          const targetY = Math.random() * canvas.height;

          // Initial chaos vectors (outward explosion)
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 2; // Explosive speed

          stars.push({
            targetX,
            targetY,
            x: targetX, // Set dynamically later
            y: targetY, // Set dynamically later
            size: Math.random() * (layerConfig.sizeRange[1] - layerConfig.sizeRange[0]) + layerConfig.sizeRange[0],
            opacity: Math.random() * 0.8 + 0.2,
            speed: Math.random() * (layerConfig.speedRange[1] - layerConfig.speedRange[0]) + layerConfig.speedRange[0],
            layer: layerConfig.layer,
            hue,
            saturation,
            lightness,
            chaosX: canvas.width / 2, // Start at center
            chaosY: canvas.height / 2, // Start at center
            chaosVX: Math.cos(angle) * speed,
            chaosVY: Math.sin(angle) * speed,
          });
        }
      });

      starsRef.current = stars;
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allSettled = true;

      starsRef.current.forEach(star => {
        const isSettlingPhase = settleStartTime.current !== null;
        const settleProgress = isSettlingPhase ? Math.min(1, (Date.now() - settleStartTime.current!) / 2500) : 0;

        // Easing function (easeOutCubic)
        const easeOut = 1 - Math.pow(1 - settleProgress, 3);

        if (isInitialLoad) {
          if (!explosionStartedRef.current) {
            // Before explosion, hold at center tightly packed, increasing in size and shaking
            const elapsed = Date.now() - initialTime.current;
            const progress = Math.min(1, elapsed / 1000); // 0 to 1 over 1000ms

            // The cluster slowly expands
            const clusterSpread = 2 + (Math.pow(progress, 2) * 30); // starts small, grows quadratically

            // The shaking becomes increasingly violent
            const shakeAmt = Math.pow(progress, 3) * 15;
            const shakeX = (Math.random() - 0.5) * shakeAmt;
            const shakeY = (Math.random() - 0.5) * shakeAmt;

            star.x = canvas.width / 2 + (Math.random() - 0.5) * clusterSpread + shakeX;
            star.y = canvas.height / 2 + (Math.random() - 0.5) * clusterSpread + shakeY;
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
            if (star.chaosX < 0 || star.chaosX > canvas.width) star.chaosVX *= -1;
            if (star.chaosY < 0 || star.chaosY > canvas.height) star.chaosVY *= -1;

            // Interpolate from chaos to target
            star.x = star.chaosX + (star.targetX - star.chaosX) * easeOut;
            star.y = star.chaosY + (star.targetY - star.chaosY) * easeOut;
            allSettled = false;
          } else {
            // Fully settled normal behavior
            star.targetX -= star.speed;
            if (star.targetX < -10) star.targetX = canvas.width + 10;
            if (star.targetY < -10) star.targetY = canvas.height + 10;
            if (star.targetY > canvas.height + 10) star.targetY = -10;
            star.x = star.targetX;
            star.y = star.targetY;
          }
        } else {
          // Standard background behavior (no initial load)
          star.targetX -= star.speed;
          if (star.targetX < -10) star.targetX = canvas.width + 10;
          if (star.targetY < -10) star.targetY = canvas.height + 10;
          if (star.targetY > canvas.height + 10) star.targetY = -10;
          star.x = star.targetX;
          star.y = star.targetY;
        }

        // Apply gravitational pull if a planet is hovered
        if (gravityCenterRef.current && (!isInitialLoad || settleStartTime.current !== null)) {
          const dx = gravityCenterRef.current.x - star.x;
          const dy = gravityCenterRef.current.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Influence radius of 150px around the planet
          if (dist > 1 && dist < 150) {
            // Force is stronger closer to the planet (0 to 1)
            const force = Math.pow((150 - dist) / 150, 2); 
            // Max pull of 0.8px per frame for a subtle but noticeable drift
            const pullAmount = force * 0.8;
            
            // Only pull, don't overshoot
            star.targetX += (dx / dist) * pullAmount;
            star.targetY += (dy / dist) * pullAmount;
            
            // Update immediate position too to avoid parallax lag fighting it
            star.x = star.targetX;
            star.y = star.targetY;
          }
        }

        // Parallax offset based on mouse position and star layer
        const parallaxX = mouseRef.current.x * star.layer * 2;
        const parallaxY = mouseRef.current.y * star.layer * 2;

        // Calculate final position with parallax
        const finalX = star.x + parallaxX;
        const finalY = star.y + parallaxY;

        // Twinkle effect
        const twinkle = Math.sin(Date.now() * 0.003 + star.x * 0.05) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Draw star
        ctx.beginPath();

        // Determine colors
        let starFill = 'black';
        let glowStart = `rgba(0,0,0, ${currentOpacity})`;
        let glowMid = `rgba(0,0,0, ${currentOpacity * 0.5})`;
        let glowEnd = 'rgba(0,0,0,0)';
        let sparkleColor = `rgba(0,0,0, ${currentOpacity * 0.6})`;

        if (!isDarkMode) {
          // Colorful Mode (Dark Background)
          if (star.hue !== undefined) {
            starFill = `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, 1)`;
            glowStart = `hsla(${star.hue}, ${star.saturation}%, 60%, ${currentOpacity * 0.9})`;
            glowMid = `hsla(${star.hue}, ${star.saturation}%, 60%, ${currentOpacity * 0.5})`;
            glowEnd = `hsla(${star.hue}, ${star.saturation}%, 60%, 0)`;
            sparkleColor = `hsla(${star.hue}, ${star.saturation}%, 80%, ${currentOpacity * 0.8})`;
          } else {
            starFill = 'white';
            glowStart = `rgba(255, 255, 255, ${currentOpacity * 0.9})`;
            glowMid = `rgba(255, 255, 255, ${currentOpacity * 0.5})`;
            glowEnd = `rgba(100, 150, 255, 0)`;
            sparkleColor = `rgba(255, 255, 255, ${currentOpacity * 0.6})`;
          }
        }

        // OPTIMIZATION: Only use expensive gradients for larger/closer stars (layers 2, 3, 4)
        // Layer 1 (1000 stars) will use simple solid circles for performance
        if (star.layer > 1) {
          // Outer glow (larger, more transparent)
          const glowSize = star.size * 4;
          const gradient = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, glowSize);
          gradient.addColorStop(0, glowStart);
          gradient.addColorStop(0.1, glowMid);
          gradient.addColorStop(1, glowEnd);

          ctx.fillStyle = gradient;
          ctx.arc(finalX, finalY, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Inner bright core
          ctx.beginPath();
          ctx.fillStyle = starFill;
          ctx.globalAlpha = currentOpacity;
          ctx.arc(finalX, finalY, star.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        } else {
          // Simple drawing for distant stars (Layer 1) - huge performance boost
          ctx.fillStyle = starFill;
          ctx.globalAlpha = currentOpacity * 0.8; // Slightly dimmer
          ctx.arc(finalX, finalY, star.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Sparkle effect for larger stars (reduced frequency)
        if (star.size > 1.5 && Math.random() > 0.995) {
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
      });

      if (isInitialLoad && allSettled && !settledCalled.current && settleStartTime.current !== null) {
        console.log('[Stars] All stars settled, calling onSettled');
        settledCalled.current = true;
        if (onSettled) onSettled();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize/Update on resize (debounced)
    resizeCanvas();
    generateStars();
    animate();

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDarkMode, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: isDarkMode ? 'transparent' : 'radial-gradient(ellipse at center, #0f1419 0%, #000000 10%)',
        transition: 'background 0.7s ease-in-out'
      }}
      aria-hidden="true"
    />
  );
};

export default Stars;
