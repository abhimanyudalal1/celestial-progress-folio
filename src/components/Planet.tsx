import { useState, useEffect, useRef } from "react";

export interface PlanetProject {
  id: string;
  title: string;
  description: string;
  stack: string[];
  completionPercent: number;
  links: {
    github?: string;
    live?: string;
  };
  accentColor: string;
  orbitIndex: number;
}

interface PlanetProps {
  project: PlanetProject;
  onClick: () => void;
  position: { x: number; y: number };
}

const Planet = ({ project, onClick, position }: PlanetProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const planetRef = useRef<HTMLButtonElement>(null);
  const [currentPos, setCurrentPos] = useState({ x: position.x, y: 300 - (position.y - 300) }); // Start from top

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (prefersReducedMotion) {
      // Instantly set to target position
      setCurrentPos(position);
    } else {
      // Animate to target position with stagger
      const delay = project.orbitIndex * 300;
      
      setTimeout(() => {
        setCurrentPos(position);
      }, delay);
    }

    // Animate progress ring value
    if (planetRef.current) {
      const animationDelay = project.orbitIndex * 300;
      setTimeout(() => {
        planetRef.current?.style.setProperty('--progress-value', project.completionPercent.toString());
      }, animationDelay + 100);
    }
  }, [project.completionPercent, project.orbitIndex, position]);

  return (
    <>
      <button
        ref={planetRef}
        className="absolute group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full transition-all duration-[2000ms] ease-out"
        style={{
          left: `${currentPos.x}px`,
          top: `${currentPos.y}px`,
          transform: 'translate(-50%, -50%)',
          // @ts-ignore - CSS custom property
          '--progress-value': '0',
        }}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`${project.title} - ${project.completionPercent}% complete`}
      >
        {/* Progress Ring - Donut with conic gradient */}
        <div
          className="relative w-16 h-16 md:w-20 md:h-20 rounded-full p-1 transition-[--progress-value] duration-1000"
          style={{
            background: `conic-gradient(
              hsl(${project.accentColor}) calc(var(--progress-value) * 3.6deg),
              hsl(var(--muted)) calc(var(--progress-value) * 3.6deg)
            )`,
          }}
        >
          {/* Planet Inner Circle */}
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-xs font-semibold transition-transform group-hover:scale-110"
            style={{
              background: `radial-gradient(circle at 30% 30%, hsl(${project.accentColor} / 0.8), hsl(${project.accentColor}))`,
              boxShadow: `0 0 20px hsl(${project.accentColor} / 0.4)`,
            }}
          >
            <span className="text-white drop-shadow-md">
              {project.completionPercent}%
            </span>
          </div>
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-50">
            <p className="text-sm font-medium">{project.title}</p>
            <p className="text-xs text-muted-foreground">{project.completionPercent}% Complete</p>
          </div>
        )}
      </button>
    </>
  );
};

export default Planet;
