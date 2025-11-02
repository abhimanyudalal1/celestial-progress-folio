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
 * Generate SVG semicircle path for each orbit
 * Creates arcs from top-right to bottom-right around the sun center
 * @param radius - The radius of the semicircle
 * @param cx - Center x coordinate (sun position)
 * @param cy - Center y coordinate (sun position)
 * @returns SVG path string for the semicircle arc
 */
const generateSemicirclePath = (radius: number, cx: number, cy: number): string => {
  const startX = cx;
  const startY = cy - radius;
  const endX = cx;
  const endY = cy + radius;
  
  // SVG arc: M startX,startY A rx,ry rotation large-arc-flag sweep-flag endX,endY
  // large-arc-flag=0 for semicircle, sweep-flag=0 for left arc
  return `M ${startX} ${startY} A ${radius} ${radius} 0 0 0 ${endX} ${endY}`;
};

const SolarSystem = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);

  // Define orbit radii - adjust these to change spacing
  // Tokens: r1 through r6 for up to 6 projects
  const orbitRadii = {
    r1: 140,
    r2: 200,
    r3: 260,
    r4: 320,
    r5: 380,
    r6: 440,
  };

  // Sun center position - right side of canvas
  // These should align with the half-sun position
  const sunCenterX = 600; // Adjust based on layout
  const sunCenterY = 300; // Centered vertically in the canvas

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-4" aria-label="Projects Solar System">
      <div className="text-center mb-12 absolute top-20 left-1/2 -translate-x-1/2 z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Orbiting Projects</h2>
        <p className="text-lg text-muted-foreground">
          Watch each planet travel to its completion percentage
        </p>
      </div>

      {/* Solar System Canvas - SVG for orbit paths */}
      <div className="relative w-full max-w-6xl" style={{ height: '600px' }} role="region" aria-label="Interactive project orbits">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Draw semicircle orbit trails (underlays with rounded caps) */}
          {projects.map((project) => {
            const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
            const path = generateSemicirclePath(radius, sunCenterX, sunCenterY);
            
            return (
              <g key={`orbit-${project.id}`}>
                {/* Wider translucent trail */}
                <path
                  d={path}
                  fill="none"
                  stroke="hsl(var(--orbit-line))"
                  strokeWidth="28"
                  strokeLinecap="round"
                  opacity="0.15"
                />
                {/* Main orbit path */}
                <path
                  d={path}
                  fill="none"
                  stroke="hsl(var(--orbit-line))"
                  strokeWidth="22"
                  strokeLinecap="round"
                  opacity="0.3"
                />
              </g>
            );
          })}
        </svg>

        {/* Planets positioned using CSS motion path */}
        <div className="relative w-full h-full">
          {projects.map((project) => {
            const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
            const orbitPath = generateSemicirclePath(radius, sunCenterX, sunCenterY);
            
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
