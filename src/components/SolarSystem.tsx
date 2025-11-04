import { useState } from "react";
import { PlanetProject } from "./Planet";
import ProjectPanel from "./ProjectPanel";

// Sample project data - 5 projects
const projects: PlanetProject[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include real-time inventory management, user authentication, and a responsive checkout flow.",
    stack: ["React", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
    completionPercent: 45,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "200 85% 55%",
    orbitIndex: 1,
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A collaborative project management tool with drag-and-drop functionality, real-time updates via WebSockets, and team collaboration features.",
    stack: ["TypeScript", "Next.js", "Prisma", "Socket.io", "shadcn/ui"],
    completionPercent: 32,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "280 70% 60%",
    orbitIndex: 2,
  },
  {
    id: "3",
    title: "AI Content Generator",
    description: "An AI-powered content creation tool leveraging GPT-4 for blog posts, social media, and marketing copy. Includes templates and tone customization.",
    stack: ["React", "OpenAI API", "Firebase", "Framer Motion"],
    completionPercent: 68,
    links: {
      github: "https://github.com",
    },
    accentColor: "140 70% 50%",
    orbitIndex: 3,
  },
  {
    id: "4",
    title: "Weather Dashboard",
    description: "A beautiful weather forecasting dashboard with interactive maps, hourly predictions, and location-based alerts. Built with modern design patterns.",
    stack: ["Vue.js", "D3.js", "OpenWeather API", "CSS Grid"],
    completionPercent: 10,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "15 85% 55%",
    orbitIndex: 4,
  },
  {
    id: "5",
    title: "Portfolio Analytics",
    description: "Real-time analytics dashboard for tracking portfolio performance, visitor insights, and engagement metrics with beautiful data visualizations.",
    stack: ["React", "Chart.js", "Express", "MongoDB", "AWS"],
    completionPercent: 75,
    links: {
      github: "https://github.com",
    },
    accentColor: "260 75% 65%",
    orbitIndex: 5,
  },
];

/**
 * Calculate planet position on an elliptical orbit
 * @param radiusX - Horizontal radius of the ellipse
 * @param radiusY - Vertical radius of the ellipse (compressed for 3D effect)
 * @param sunCenterX - X coordinate of sun center
 * @param sunCenterY - Y coordinate of sun center
 * @param angleDeg - Angle in degrees for position on ellipse
 */
const getPlanetPosition = (
  radiusX: number,
  radiusY: number,
  sunCenterX: number,
  sunCenterY: number,
  angleDeg: number
): { x: number; y: number } => {
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = sunCenterX + radiusX * Math.cos(angleRad);
  const y = sunCenterY + radiusY * Math.sin(angleRad);
  return { x, y };
};

const SolarSystem = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);

  // SVG viewBox dimensions - extend left to show full orbits, shifted for left alignment
  const viewBoxWidth = 110;
  const viewBoxHeight = 900;
  const viewBoxLeft = -390; // Start viewBox further left to accommodate the shifted sun and orbits

  // Sun center position - aligned with Hero component, shifted left
  // Hero component positions sun at -250px (mobile) or -350px (desktop) with width 500px/700px
  // The sun's geometric center should be at the viewport's left edge (x=0 in screen coordinates)
  // For mobile: sun left edge at -250px, width 500px, so center at -250 + 250 = 0px
  // For desktop: sun left edge at -350px, width 700px, so center at -350 + 350 = 0px
  // In SVG coordinates, we need to map this to our viewBox
  // Shifting the entire setup left by moving sun center from 0 to -100
  const sunCenterX = -100; // Sun center shifted left
  const sunCenterY = viewBoxHeight / 2; // Vertically centered at 450

  // Orbit radii for the 5 planets - these should extend from the sun center at x=0
  const orbitRadii = {
    r1: 300,
    r2: 450,
    r3: 600,
    r4: 750,
    r5: 900,
  };

  return (
    <section className="absolute inset-0 flex items-center justify-start pointer-events-none z-10" aria-label="Projects Solar System">
      <div className="relative w-full h-full">
        {/* 3D Stage Container with Perspective */}
        <div 
          className="absolute inset-0"
          style={{
            perspective: '2000px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          <div 
            className="w-full h-full solar-system-stage"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateX(25deg) rotateY(-8deg)',
              transformOrigin: 'center center',
              transition: 'transform 0.6s ease-out',
            }}
          >
            <svg
              className="w-full h-full"
              viewBox={`${viewBoxLeft} 0 ${viewBoxWidth} ${viewBoxHeight}`}
              preserveAspectRatio="xMinYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                pointerEvents: 'none', // Allow interactions to pass through to planets
              }}
            >
          {/* Define patterns for dashed strokes */}
          <defs>
            <pattern id="dashPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="20" y2="0" stroke="white" strokeWidth="2" strokeDasharray="8 12" />
            </pattern>
            {/* Radial gradient for sun glow */}
            <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(45 100% 60%)" stopOpacity="0.3" />
              <stop offset="70%" stopColor="hsl(35 100% 50%)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            {/* Linear gradient for orbit depth effect */}
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Visual sun marker for alignment (optional, for debugging) */}
          <circle
            cx={sunCenterX}
            cy={sunCenterY}
            r="25"
            fill="url(#sunGradient)"
            stroke="hsl(45 100% 60%)"
            strokeWidth="2"
            opacity="0.4"
            style={{
              filter: 'drop-shadow(0 0 15px hsl(45 100% 60% / 0.5))',
            }}
          />

          {/* Draw full elliptical orbits and planets - orbits go around the back of the sun */}
          {projects.map((project, index) => {
            const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
            // Distribute planets based on their orbit index and some variation
            // Keep angles within right semicircle (270° to 90°, going clockwise)
            const baseAngle = 300; // Start from upper-right
            const angleStep = 20; // 20 degrees between each planet
            const angle = (baseAngle + (project.orbitIndex - 1) * angleStep) % 360;
            
            // Create full elliptical orbit that goes around the back of the sun
            // Use ellipse instead of arc for full 3D effect
            const ellipseRx = radius; // Horizontal radius
            const ellipseRy = radius * 0.7; // Vertical radius (compressed for 3D perspective)
            
            // Calculate planet position on this elliptical orbit
            const position = getPlanetPosition(ellipseRx, ellipseRy, sunCenterX, sunCenterY, angle);
            const planetRadius = 20; // Size of planet circle
            
            return (
              <g key={`orbit-planet-${project.id}`}>
                {/* Full elliptical orbit path */}
                <ellipse
                  cx={sunCenterX}
                  cy={sunCenterY}
                  rx={ellipseRx}
                  ry={ellipseRy}
                  fill="none"
                  stroke="url(#orbitGradient)"
                  strokeWidth="2"
                  strokeDasharray="8 12"
                  opacity="0.7"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
                  }}
                />
                
                {/* Planet positioned on this orbit */}
                <g
                  className="pointer-events-auto planet-group"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedProject(project)}
                  transform={`translate(${position.x}, ${position.y})`}
                >
                  <g 
                    className="planet-inner" 
                    transform="scale(1)" 
                    style={{ 
                      transformOrigin: 'center center',
                    }}
                  >
                    {/* Planet circle */}
                    <circle
                      cx="0"
                      cy="0"
                      r={planetRadius}
                      fill={`hsl(${project.accentColor})`}
                      stroke={`hsl(${project.accentColor})`}
                      strokeWidth="2"
                      opacity="0.9"
                      style={{
                        filter: `drop-shadow(0 0 10px hsl(${project.accentColor} / 0.6))`,
                      }}
                    />
                    {/* Planet inner glow */}
                    <circle
                      cx="0"
                      cy="0"
                      r={planetRadius * 0.7}
                      fill={`hsl(${project.accentColor} / 0.5)`}
                    />
                  </g>
                  {/* Project title text */}
                  <text
                    x="0"
                    y={planetRadius + 35}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="500"
                    className="drop-shadow-lg pointer-events-none"
                  >
                    {project.title}
                  </text>
                </g>
              </g>
            );
          })}

        </svg>
          </div>
        </div>
      </div>

      {/* Project Details Panel */}
      {selectedProject && (
        <ProjectPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};

export default SolarSystem;
