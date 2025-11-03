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
  orbitPath: string;
}

const Planet = ({ project, onClick, orbitPath }: PlanetProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const planetRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (planetRef.current) {
      const element = planetRef.current;
      
      if (prefersReducedMotion) {
        // Instantly set to target position without animation
        element.style.offsetDistance = `${project.completionPercent}%`;
      } else {
        // Animate from 0% to completionPercent with stagger
        const delay = project.orbitIndex * 100; // Reduced from 300ms to 100ms
        
        setTimeout(() => {
          element.style.setProperty('--target-distance', `${project.completionPercent}%`);
          element.style.animation = `travel-orbit ${3000 + project.orbitIndex * 100}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`;
        }, delay);
      }

      // Animate progress ring value
      const animationDelay = project.orbitIndex * 100; // Reduced from 300ms to 100ms
      setTimeout(() => {
        element.style.setProperty('--progress-value', project.completionPercent.toString());
      }, animationDelay + 100);
    }
  }, [project.completionPercent, project.orbitIndex]);

  return (
    <>
      <button
        ref={planetRef}
        className="absolute group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
        style={{
          offsetPath: `path('${orbitPath}')`,
          offsetRotate: '0deg',
          offsetDistance: '0%',
          // @ts-ignore - CSS custom property
          '--progress-value': '0',
          '--target-distance': '0%',
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
