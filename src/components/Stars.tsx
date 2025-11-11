import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  layer: number;
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
        { count: 100, sizeRange: [0.5, 1], speedRange: [0.1, 0.3], layer: 1 }, // Distant stars
        { count: 60, sizeRange: [1, 1.5], speedRange: [0.3, 0.2], layer: 2 },  // Mid stars
        { count: 30, sizeRange: [1.5, 2.5], speedRange: [0.35, 0.35], layer: 3 },  // Close stars
        { count: 15, sizeRange: [1.8, 2.6], speedRange: [0.35, 0.35], layer: 4 },      // Closest stars
      ];

      layers.forEach(layerConfig => {
        for (let i = 0; i < layerConfig.count; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * (layerConfig.sizeRange[1] - layerConfig.sizeRange[0]) + layerConfig.sizeRange[0],
            opacity: Math.random() * 0.8 + 0.2,
            speed: Math.random() * (layerConfig.speedRange[1] - layerConfig.speedRange[0]) + layerConfig.speedRange[0],
            layer: layerConfig.layer
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
        star.y += Math.sin(Date.now() * 0.001 + star.x * 0.01) * 0.1;

        // Wrap around screen
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

        // Calculate final position with parallax
        const finalX = star.x + parallaxX;
        const finalY = star.y + parallaxY;

        // Twinkle effect
        const twinkle = Math.sin(Date.now() * 0.005 + star.x * 0.01) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Draw star with glow effect
        ctx.beginPath();
        
        // Determine colors based on theme
        const starColor = isDarkMode ? '0, 0, 0' : '255, 255, 255';
        const glowColor1 = isDarkMode ? '0, 0, 0' : '200, 220, 255';
        const glowColor2 = isDarkMode ? '50, 50, 50' : '100, 150, 255';
        
        // Outer glow (larger, more transparent)
        const glowSize = star.size * 3;
        const gradient = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, glowSize);
        gradient.addColorStop(0, `rgba(${starColor}, ${currentOpacity * 0.8})`);
        gradient.addColorStop(0.3, `rgba(${glowColor1}, ${currentOpacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${glowColor2}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(finalX, finalY, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.beginPath();
        ctx.fillStyle = `rgba(${starColor}, ${currentOpacity})`;
        ctx.arc(finalX, finalY, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle effect for larger stars
        if (star.size > 2 && Math.random() > 0.98) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${starColor}, ${currentOpacity * 0.8})`;
          ctx.lineWidth = 0.5;
          
          // Draw cross sparkle
          ctx.moveTo(finalX - star.size * 2, finalY);
          ctx.lineTo(finalX + star.size * 2, finalY);
          ctx.moveTo(finalX, finalY - star.size * 2);
          ctx.lineTo(finalX, finalY + star.size * 2);
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
        background: isDarkMode ? 'transparent' : 'radial-gradient(ellipse at center, #0f1419 0%, #000000 70%)',
        transition: 'background 0.5s ease'
      }}
      aria-hidden="true"
    />
  );
};

export default Stars;
