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
  size?: string | number; // optional per-planet size
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
        element.style.offsetDistance = `${project.completionPercent}%`;
      } else {
        const delay = project.orbitIndex * 100;
        setTimeout(() => {
          element.style.setProperty('--target-distance', `${project.completionPercent}%`);
          element.style.animation = `travel-orbit ${3000 + project.orbitIndex * 100}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`;
        }, delay);
      }
      const animationDelay = project.orbitIndex * 100;
      setTimeout(() => {
        element.style.setProperty('--progress-value', project.completionPercent.toString());
      }, animationDelay + 100);
    }
  }, [project.completionPercent, project.orbitIndex]);

  const resolvedSize = typeof project.size === 'number' ? `${project.size}px` : project.size ?? 'clamp(8rem, 12vw, 16rem)';
  const resolvedShadow = typeof project.size === 'number' ? `${Math.max(12, Math.round(Number(project.size) * 0.25))}px` : 'clamp(1.5rem, 3vw, 6rem)';

  return (
    <>
      <button
        ref={planetRef}
        className="absolute group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
        // @ts-ignore - using CSS custom properties
        style={{
          offsetPath: `path('${orbitPath}')`,
          offsetRotate: '0deg',
          offsetDistance: '0%',
          '--progress-value': '0',
          '--target-distance': '0%',
          '--planet-size': resolvedSize,
          '--planet-shadow': resolvedShadow,
        } as any}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`${project.title} - ${project.completionPercent}% complete`}
      >
        <div
          className="relative rounded-full p-1 transition-[--progress-value] duration-1000"
          style={{
            width: 'var(--planet-size)',
            height: 'var(--planet-size)',
            background: `conic-gradient( hsl(${project.accentColor}) calc(var(--progress-value) * 3.6deg), hsl(var(--muted)) calc(var(--progress-value) * 3.6deg) )`,
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-xs font-semibold transition-transform group-hover:scale-110"
            style={{
              background: `radial-gradient(circle at 30% 30%, hsl(${project.accentColor} / 0.8), hsl(${project.accentColor}))`,
              boxShadow: `0 0 var(--planet-shadow) hsl(${project.accentColor} / 0.4)`,
            }}
          />
        </div>

        {showTooltip && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-50"
            style={{
              bottom: 'calc(var(--planet-size) / 2 + 1rem)',
              padding: 'clamp(0.25rem, 0.5vw, 0.75rem) clamp(0.5rem, 1vw, 1rem)',
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
