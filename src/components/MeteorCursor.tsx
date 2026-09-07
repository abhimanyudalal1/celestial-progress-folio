import { useEffect, useRef, useState } from 'react';

// The four tail layers, in render order: [width multiplier on the head-to-cursor distance,
// max width]. Kept out of the component so the JSX below can stay completely static.
const TAILS = [
  { mult: 1, cap: 400 },
  { mult: 0.6, cap: 200 },
  { mult: 0.9, cap: 200 },
  { mult: 0.6, cap: 120 },
];

const MeteorCursor = () => {
  const [isVisible, setIsVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Positions live in refs and are written straight to style. This used to be React state
  // updated on every animation frame, which re-rendered and re-reconciled the whole cursor
  // 60 times a second on top of everything else animating on the page.
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Lag effect - smoothly follow the mouse with ~1 second delay
  useEffect(() => {
    if (!isVisible) return;

    const lagFactor = 0.002; // Much lower for ~1 second delay effect
    let animationFrameId: number;

    const tick = () => {
      animationFrameId = requestAnimationFrame(tick);

      const mouse = mouseRef.current;
      const cursor = cursorRef.current;
      cursor.x += (mouse.x - cursor.x) * lagFactor;
      cursor.y += (mouse.y - cursor.y) * lagFactor;

      const container = containerRef.current;
      if (!container) return;

      // Calculate angle and distance for meteor tail direction
      const deltaX = mouse.x - cursor.x;
      const deltaY = mouse.y - cursor.y;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      container.style.transform = `translate(${cursor.x}px, ${cursor.y}px) translate(-50%, -50%)`;

      const rotate = `translate(-100%, -50%) rotate(${angle}deg)`;
      for (let i = 0; i < TAILS.length; i++) {
        const el = tailRefs.current[i];
        if (!el) continue;
        el.style.width = `${Math.min(distance * TAILS[i].mult, TAILS[i].cap)}px`;
        el.style.transform = rotate;
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Meteor cursor with elongated flare tail - separate from default cursor */}
      <div
        ref={containerRef}
        className="meteor-cursor fixed left-0 top-0 pointer-events-none z-[9999] mix-blend-screen"
        style={{
          transform: 'translate(-50%, -50%)',
          willChange: 'transform',
        }}
      >
        {/* Very long outer tail - slim and subtle */}
        <div
          ref={el => { tailRefs.current[0] = el; }}
          className="absolute"
          style={{
            width: '0px',
            height: '10px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(40, 140, 255, 0.08) 15%, rgba(60, 160, 255, 0.12) 40%, rgba(80, 180, 255, 0.18) 60%, rgba(100, 200, 255, 0.25) 80%, rgba(120, 220, 255, 0.35) 95%)',
            transform: 'translate(-100%, -50%)',
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
          ref={el => { tailRefs.current[1] = el; }}
          className="absolute"
          style={{
            width: '0px',
            height: '20px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(50, 150, 255, 0.15) 20%, rgba(70, 170, 255, 0.28) 50%, rgba(90, 190, 255, 0.45) 75%, rgba(110, 210, 255, 0.6) 95%)',
            transform: 'translate(-100%, -50%)',
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
          ref={el => { tailRefs.current[2] = el; }}
          className="absolute"
          style={{
            width: '0px',
            height: '10px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(80, 180, 255, 0.3) 30%, rgba(100, 200, 255, 0.55) 60%, rgba(120, 220, 255, 0.75) 85%, rgba(140, 230, 255, 0.9) 100%)',
            transform: 'translate(-100%, -50%)',
            transformOrigin: 'right center',
            left: '50%',
            top: '50%',
            borderRadius: '50% 0 0 50%',
            filter: 'blur(3px)',
          }}
        />

        {/* Core bright tail - very slim */}
        <div
          ref={el => { tailRefs.current[3] = el; }}
          className="absolute"
          style={{
            width: '0px',
            height: '5px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(100, 200, 255, 0.5) 40%, rgba(120, 220, 255, 0.75) 70%, rgba(150, 235, 255, 0.95) 100%)',
            transform: 'translate(-100%, -50%)',
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
