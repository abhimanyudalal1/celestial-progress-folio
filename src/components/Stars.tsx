import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  layer: number;
  hue?: number;
  saturation?: number;
  lightness?: number;
}

const Stars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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

          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * (layerConfig.sizeRange[1] - layerConfig.sizeRange[0]) + layerConfig.sizeRange[0],
            opacity: Math.random() * 0.8 + 0.2,
            speed: Math.random() * (layerConfig.speedRange[1] - layerConfig.speedRange[0]) + layerConfig.speedRange[0],
            layer: layerConfig.layer,
            hue,
            saturation,
            lightness
          });
        }
      });

      starsRef.current = stars;
    };

    // Mouse move handler for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        // Parallax offset based on mouse position and star layer
        const parallaxX = mouseRef.current.x * star.layer * 2;
        const parallaxY = mouseRef.current.y * star.layer * 2;

        // Slow drift animation
        star.x -= star.speed * 0.5;
        star.y += Math.sin(Date.now() * 0.001 + star.x * 0.01) * 0.05;

        // Wrap around screen
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

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

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    generateStars();
    animate();

    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas();
      generateStars();
    });
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDarkMode]);

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
