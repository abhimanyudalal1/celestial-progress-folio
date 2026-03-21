import { useEffect, useRef } from "react";

export interface WarpParams {
  chromatic: number;
}

interface WarpTunnelProps {
  params?: React.MutableRefObject<WarpParams>;
}

export const WarpTunnel: React.FC<WarpTunnelProps> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    
    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const stars: { x: number, y: number, z: number }[] = [];
    const numStars = 800; // Dense starfield for warp effect
    
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * 2000, 
      });
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const speed = 15; // Fast forward movement

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.z -= speed;
        if (star.z <= 0) {
           star.x = (Math.random() - 0.5) * canvas.width * 2;
           star.y = (Math.random() - 0.5) * canvas.height * 2;
           star.z = 2000;
        }

        const k = 1200 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        // Draw line from previous z to current z for the "streak" effect
        const prevZ = star.z + speed * 2; 
        const prevK = 1200 / prevZ;
        const prevPx = star.x * prevK + centerX;
        const prevPy = star.y * prevK + centerY;

        const size = (1 - star.z / 2000) * 3;
        const alpha = Math.max(0, 1 - star.z / 2000);
        
        // Dynamic Chromatic Multiplier from GSAP
        const chromaticIntensity = params?.current ? params.current.chromatic : 1;
        
        ctx.lineWidth = size;
        
        if (chromaticIntensity > 0) {
          // Chromatic Aberration - Cyan
          ctx.beginPath();
          ctx.moveTo(prevPx - (4 * chromaticIntensity), prevPy);
          ctx.lineTo(px - (4 * chromaticIntensity), py);
          ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.8 * chromaticIntensity})`;
          ctx.stroke();

          // Chromatic Aberration - Magenta
          ctx.beginPath();
          ctx.moveTo(prevPx + (4 * chromaticIntensity), prevPy);
          ctx.lineTo(px + (4 * chromaticIntensity), py);
          ctx.strokeStyle = `rgba(255, 0, 255, ${alpha * 0.8 * chromaticIntensity})`;
          ctx.stroke();
        }

        // Core White Streak
        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block" 
      style={{ background: 'transparent' }} 
    />
  );
};

export default WarpTunnel;
