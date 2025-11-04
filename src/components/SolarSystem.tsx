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
 * Calculate planet position on a semicircle orbit
 * @param radius - Orbit radius
 * @param sunCenterX - X coordinate of sun center (off-canvas on right)
 * @param sunCenterY - Y coordinate of sun center
 * @param angleDeg - Angle in degrees (270 = top, 180 = left, 90 = bottom in standard math, but SVG uses different)
 *                    For SVG: 0° = right, 90° = down, 180° = left, 270° = up
 */
const getPlanetPosition = (
  radius: number,
  sunCenterX: number,
  sunCenterY: number,
  angleDeg: number
): { x: number; y: number } => {
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = sunCenterX + radius * Math.cos(angleRad);
  const y = sunCenterY + radius * Math.sin(angleRad);
  return { x, y };
};

const SolarSystem = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);

  // SVG viewBox dimensions
  const viewBoxWidth = 1200;
  const viewBoxHeight = 900;

  // Sun center position - aligned with Hero component
  // Sun is positioned at left: -250px (mobile) or -350px (desktop)
  // Width: 500px (mobile) or 700px (desktop)
  // The sun's geometric center is at x = 0 (where left edge + width/2 = -250 + 250 = 0)
  // But since the sun is partially off-screen, we position orbits relative to this center
  // For SVG, we use x = 50 to account for proper positioning within viewBox
  const sunCenterX = 50; // Left edge position, accounting for sun being partially off-screen
  const sunCenterY = viewBoxHeight / 2; // Vertically centered at 450

  // Orbit radii for the 5 planets - these should extend from the sun center
  const orbitRadii = {
    r1: 300,
    r2: 420,
    r3: 540,
    r4: 660,
    r5: 780,
  };

  // Planet positions along the semicircle (angles in degrees for SVG coordinate system)
  // Sun is on the left, so orbits extend to the right
  // 0° = right (straight out), 90° = down, 180° = left, 270° = up
  // We want the right semicircle visible, so angles from 270° (top) to 90° (bottom)
  const planetAngles = [250, 220, 180, 140, 110]; // From top to bottom of the visible right semicircle

  return (
    <section className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" aria-label="Projects Solar System">
      <div className="relative w-full h-full">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Define patterns for dashed strokes */}
          <defs>
            <pattern id="dashPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="20" y2="0" stroke="white" strokeWidth="2" strokeDasharray="8 12" />
            </pattern>
          </defs>

          {/* Draw orbit arcs (semicircles) and planets together - sun is on the left */}
          {projects.map((project, index) => {
            const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
            const angle = planetAngles[index];
            
            // Draw right semicircle from top to bottom (right side visible)
            // SVG angles: 0° = right, 90° = down, 180° = left, 270° = up
            // For right semicircle: start at 270° (top), end at 90° (bottom)
            const startAngle = 270; // Top
            const endAngle = 90;   // Bottom
            
            const startX = sunCenterX + radius * Math.cos((startAngle * Math.PI) / 180);
            const startY = sunCenterY + radius * Math.sin((startAngle * Math.PI) / 180);
            const endX = sunCenterX + radius * Math.cos((endAngle * Math.PI) / 180);
            const endY = sunCenterY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            // Calculate planet position on this orbit
            const position = getPlanetPosition(radius, sunCenterX, sunCenterY, angle);
            const planetRadius = 20; // Size of planet circle
            
            return (
              <g key={`orbit-planet-${project.id}`}>
                {/* Orbit path */}
                <path
                  d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="8 12"
                  opacity="0.6"
                />
                
                {/* Planet positioned on this orbit */}
                <g
                  className="pointer-events-auto"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedProject(project)}
                  transform={`translate(${position.x}, ${position.y})`}
                >
                  <g className="planet-inner" transform="scale(1)" style={{ transition: 'transform 0.2s ease' }}>
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
