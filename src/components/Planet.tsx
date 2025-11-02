import { useState, useEffect } from "react";

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
  orbitRadius: number;
  orbitDuration: number;
  ellipseX: number;
  ellipseY: number;
}

interface PlanetProps {
  project: PlanetProject;
  onClick: () => void;
}

const Planet = ({ project, onClick }: PlanetProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [angle, setAngle] = useState(Math.random() * 360);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const duration = project.orbitDuration * 1000;
    const startTime = Date.now();
    const startAngle = angle;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      setAngle(startAngle + progress * 360);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [project.orbitDuration, angle]);

  // Calculate position using trigonometry
  const radian = (angle * Math.PI) / 180;
  const x = Math.cos(radian) * project.ellipseX;
  const y = Math.sin(radian) * project.ellipseY;

  // Progress ring calculation
  const progressDegrees = (project.completionPercent / 100) * 360;

  return (
    <>
      <button
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
        style={{
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          transition: "transform 0.05s linear",
        }}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`${project.title} - ${project.completionPercent}% complete`}
      >
        {/* Progress Ring */}
        <div
          className="relative w-16 h-16 md:w-20 md:h-20 rounded-full p-1"
          style={{
            background: `conic-gradient(
              hsl(${project.accentColor}) ${progressDegrees}deg,
              hsl(var(--muted)) ${progressDegrees}deg
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
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
            <p className="text-sm font-medium">{project.title}</p>
            <p className="text-xs text-muted-foreground">{project.completionPercent}% Complete</p>
          </div>
        )}
      </button>
    </>
  );
};

export default Planet;
