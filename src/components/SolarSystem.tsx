import { useState } from "react";
import Planet, { PlanetProject } from "./Planet";
import ProjectPanel from "./ProjectPanel";

// Sample project data - 5 projects with different completion percentages
const projects: PlanetProject[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include real-time inventory management, user authentication, and a responsive checkout flow.",
    stack: ["React", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
    completionPercent: 85,
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
    completionPercent: 92,
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
    completionPercent: 100,
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
    completionPercent: 45,
    links: {
      github: "https://github.com",
    },
    accentColor: "260 75% 65%",
    orbitIndex: 5,
  },
];

/**
 * Calculate planet position on orbit using polar coordinates
 * 0% = top, 50% = bottom, 100% = top (full circle)
 * For semicircle on left side: we map 0-100% to 180-360 degrees (left half)
 */
const calculatePlanetPosition = (
  radius: number,
  percentage: number,
  centerX: number,
  centerY: number
): { x: number; y: number } => {
  // Map percentage (0-100) to angle (180-360 degrees for left semicircle)
  // 0% -> 270° (top), 50% -> 180° (left), 100% -> 90° (bottom)
  const angle = (270 - (percentage * 1.8)) * (Math.PI / 180);
  
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);
  
  return { x, y };
};

/**
 * Generate SVG circle path (left semicircle only for visibility)
 */
const generateOrbitPath = (radius: number, cx: number, cy: number): string => {
  // Draw left semicircle from top to bottom
  const startX = cx;
  const startY = cy - radius;
  const endX = cx;
  const endY = cy + radius;
  
  // Arc going counter-clockwise (left side)
  return `M ${startX} ${startY} A ${radius} ${radius} 0 0 0 ${endX} ${endY}`;
};

const SolarSystem = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);

  // Define orbit radii - increased spacing for more horizontal spread
  // Tokens: r1 through r6 for up to 6 projects
  const orbitRadii = {
    r1: 200,
    r2: 320,
    r3: 440,
    r4: 560,
    r5: 680,
    r6: 800,
  };

  // Sun center position - right side of canvas
  // These should align with the half-sun position in Hero component
  // The sun is on the right edge, so we position at the far right
  const sunCenterX = 1150; // Right edge of the SVG viewBox
  const sunCenterY = 300; // Centered vertically in the canvas

  return (
    <section className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" aria-label="Projects Solar System">
      {/* Solar System Canvas - SVG for orbit paths - Full width for orbits */}
      <div className="relative w-full h-full pointer-events-none" role="region" aria-label="Interactive project orbits">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Draw semicircle orbit trails (underlays with rounded caps) */}
          {projects.map((project) => {
            const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
            const path = generateOrbitPath(radius, sunCenterX, sunCenterY);
            
            return (
              <g key={`orbit-${project.id}`}>
                {/* Thin dashed neon blue orbit line */}
                <path
                  d={path}
                  fill="none"
                  stroke="hsl(195 100% 50%)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="8 12"
                  opacity="0.6"
                />
              </g>
            );
          })}
        </svg>

        {/* Planets positioned using direct SVG coordinates */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <foreignObject x="0" y="0" width="1200" height="600" className="overflow-visible">
            <div className="relative w-full h-full pointer-events-auto" style={{ width: '1200px', height: '600px' }}>
              {projects.map((project) => {
                const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
                const position = calculatePlanetPosition(
                  radius,
                  project.completionPercent,
                  sunCenterX,
                  sunCenterY
                );
                
                return (
                  <Planet
                    key={project.id}
                    project={project}
                    position={position}
                    onClick={() => setSelectedProject(project)}
                  />
                );
              })}
            </div>
          </foreignObject>
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
