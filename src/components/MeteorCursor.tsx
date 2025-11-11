import { useEffect, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

const MeteorCursor = () => {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<Position>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Lag effect - smoothly follow the mouse with ~1 second delay
  useEffect(() => {
    const lagFactor = 0.002; // Much lower for ~1 second delay effect
    let animationFrameId: number;

    const updateCursorPosition = () => {
      setCursorPosition((prevPos) => ({
        x: prevPos.x + (mousePosition.x - prevPos.x) * lagFactor,
        y: prevPos.y + (mousePosition.y - prevPos.y) * lagFactor,
      }));
      animationFrameId = requestAnimationFrame(updateCursorPosition);
    };

    animationFrameId = requestAnimationFrame(updateCursorPosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition]);

  if (!isVisible) return null;

  // Calculate angle and distance for meteor tail direction
  const deltaX = mousePosition.x - cursorPosition.x;
  const deltaY = mousePosition.y - cursorPosition.y;
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  return (
    <>
      {/* Meteor cursor with elongated flare tail - separate from default cursor */}
      <div
        className="meteor-cursor fixed pointer-events-none z-[9999] mix-blend-screen"
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Very long outer tail - slim and subtle */}
        <div
          className="absolute"
          style={{
            width: `${Math.min(distance * 1, 400)}px`,
            height: '10px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(40, 140, 255, 0.08) 15%, rgba(60, 160, 255, 0.12) 40%, rgba(80, 180, 255, 0.18) 60%, rgba(100, 200, 255, 0.25) 80%, rgba(120, 220, 255, 0.35) 95%)',
            transform: `translate(-100%, -50%) rotate(${angle}deg)`,
            transformOrigin: 'right center',
            left: '50%',
            top: '50%',
            borderRadius: '50% 0 0 50%',
            filter: 'blur(6px)',
            opacity: 0.7,
          }}
        />

        {/* Long middle tail - slimmer */}
        <div
          className="absolute"
          style={{
            width: `${Math.min(distance * 0.6, 200)}px`,
            height: '20px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(50, 150, 255, 0.15) 20%, rgba(70, 170, 255, 0.28) 50%, rgba(90, 190, 255, 0.45) 75%, rgba(110, 210, 255, 0.6) 95%)',
            transform: `translate(-100%, -50%) rotate(${angle}deg)`,
            transformOrigin: 'right center',
            left: '50%',
            top: '50%',
            borderRadius: '50% 0 0 50%',
            filter: 'blur(4px)',
            opacity: 0.8,
          }}
        />

        {/* Inner bright tail - slim */}
        <div
          className="absolute"
          style={{
            width: `${Math.min(distance * 0.9, 200)}px`,
            height: '10px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(80, 180, 255, 0.3) 30%, rgba(100, 200, 255, 0.55) 60%, rgba(120, 220, 255, 0.75) 85%, rgba(140, 230, 255, 0.9) 100%)',
            transform: `translate(-100%, -50%) rotate(${angle}deg)`,
            transformOrigin: 'right center',
            left: '50%',
            top: '50%',
            borderRadius: '50% 0 0 50%',
            filter: 'blur(3px)',
          }}
        />

        {/* Core bright tail - very slim */}
        <div
          className="absolute"
          style={{
            width: `${Math.min(distance * 0.6, 120)}px`,
            height: '5px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(100, 200, 255, 0.5) 40%, rgba(120, 220, 255, 0.75) 70%, rgba(150, 235, 255, 0.95) 100%)',
            transform: `translate(-100%, -50%) rotate(${angle}deg)`,
            transformOrigin: 'right center',
            left: '50%',
            top: '50%',
            borderRadius: '50% 0 0 50%',
            filter: 'blur(2px)',
          }}
        />

        {/* Medium glow around meteor head - contained */}
        <div
          className="absolute rounded-full"
          style={{
            width: '5px',
            height: '5px',
            background: 'radial-gradient(circle, rgba(60, 160, 255, 0.7) 0%, rgba(40, 140, 255, 0.5) 50%, rgba(20, 120, 255, 0.2) 80%, transparent 100%)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            filter: 'blur(3px)',
          }}
        />

        {/* Bright white core - small and focused */}
        <div
          className="absolute rounded-full"
          style={{
            width: '5px',
            height: '5px',
            background: 'radial-gradient(circle, rgba(180, 230, 255, 1) 0%, rgba(80, 180, 255, 0.95) 40%, rgba(40, 140, 255, 0.85) 100%)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            boxShadow: '0 0 10px rgba(60, 160, 255, 1), 0 0 20px rgba(40, 140, 255, 0.8), 0 0 30px rgba(20, 120, 255, 0.5)',
          }}
        />
      </div>
    </>
  );
};

export default MeteorCursor;
