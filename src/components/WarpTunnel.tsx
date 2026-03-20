import { useEffect, useRef } from "react";

export const WarpTunnel = () => {
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
        
        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.lineWidth = size;
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - star.z / 2000})`;
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
