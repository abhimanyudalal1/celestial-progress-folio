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
        {/* Progress Ring - Donut with conic gradient - DOUBLED size */}
        <div
          className="relative rounded-full p-1 transition-[--progress-value] duration-1000"
          style={{
            width: 'clamp(8rem, 12vw, 16rem)', // DOUBLED: Min 8rem, preferred 12vw, max 16rem
            height: 'clamp(8rem, 12vw, 16rem)', // Keep aspect ratio
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
              boxShadow: `0 0 clamp(1.5rem, 3vw, 6rem) hsl(${project.accentColor} / 0.4)`, // DOUBLED shadow size
            }}
          >
          </div>
        </div>

        {/* Tooltip - responsive positioning */}
        {showTooltip && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-50"
            style={{
              bottom: 'clamp(3rem, 4vw, 6rem)', // Position based on planet size
              padding: 'clamp(0.25rem, 0.5vw, 0.75rem) clamp(0.5rem, 1vw, 1rem)', // Responsive padding
            }}
          >
            <p className="font-medium" style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}>{project.title}</p>
            <p className="text-muted-foreground" style={{ fontSize: 'clamp(0.625rem, 1vw, 0.875rem)' }}>{project.completionPercent}% Complete</p>
          </div>
        )}
      </button>
    </>
  );
};

export default Planet;
