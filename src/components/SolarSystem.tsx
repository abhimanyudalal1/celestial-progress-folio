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
 * Generate SVG circle path (right semicircle only for visibility)
 */
const generateOrbitPath = (radius: number, cx: number, cy: number): string => {
  // Draw right semicircle from top to bottom
  const startX = cx;
  const startY = cy - radius;
  const endX = cx;
  const endY = cy + radius;
  
  // Arc going clockwise (right side)
  return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
};

const SolarSystem = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);

  // Define orbit radii - increased spacing for more horizontal spread
  // Tokens: r1 through r6 for up to 6 projects
  const orbitRadii = {
    r1: 300,
    r2: 420,
    r3: 540,
    r4: 660,
    r5: 780,
    r6: 900,
  };

  // Sun center position - left side of canvas
  // These should align with the half-sun position in Hero component
  // The sun is on the left edge, so we position at the far left
  const sunCenterX = 50; // Left edge of the SVG viewBox
  const sunCenterY = 450; // Positioned higher to allow orbits to extend down

  return (
    <section className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" aria-label="Projects Solar System">
      {/* Solar System Canvas - SVG for orbit paths - Full width for orbits */}
      <div className="relative w-full h-full pointer-events-none" role="region" aria-label="Interactive project orbits">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 900"
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

        {/* Planets positioned using CSS offset-path */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          {projects.map((project) => {
            const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
            const orbitPath = generateOrbitPath(radius, sunCenterX, sunCenterY);
            
            return (
              <Planet
                key={project.id}
                project={project}
                orbitPath={orbitPath}
                onClick={() => setSelectedProject(project)}
              />
            );
          })}
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
