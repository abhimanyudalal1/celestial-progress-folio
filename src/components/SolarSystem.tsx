import { useState } from "react";
import Planet, { PlanetProject } from "./Planet";
import ProjectPanel from "./ProjectPanel";

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
    orbitRadius: 180,
    orbitDuration: 40,
    ellipseX: 180,
    ellipseY: 140,
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
    orbitRadius: 240,
    orbitDuration: 50,
    ellipseX: 240,
    ellipseY: 180,
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
    orbitRadius: 300,
    orbitDuration: 60,
    ellipseX: 300,
    ellipseY: 220,
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
    orbitRadius: 360,
    orbitDuration: 70,
    ellipseX: 360,
    ellipseY: 260,
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
    orbitRadius: 420,
    orbitDuration: 80,
    ellipseX: 420,
    ellipseY: 300,
  },
];

const SolarSystem = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-4" aria-label="Projects Solar System">
      <div className="text-center mb-12 absolute top-20 left-1/2 -translate-x-1/2 z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Orbiting Projects</h2>
        <p className="text-lg text-muted-foreground">
          Click any planet to explore project details
        </p>
      </div>

      {/* Solar System Canvas */}
      <div className="relative w-full max-w-5xl aspect-square" role="region" aria-label="Interactive project orbits">
        {/* Central reference point */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground/20" />

        {/* Orbit Rings */}
        {projects.map((project) => (
          <div
            key={`orbit-${project.id}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-dashed rounded-full pointer-events-none"
            style={{
              width: `${project.ellipseX * 2}px`,
              height: `${project.ellipseY * 2}px`,
              borderColor: "hsl(var(--orbit-line))",
              opacity: 0.3,
            }}
          />
        ))}

        {/* Planets */}
        {projects.map((project) => (
          <Planet
            key={project.id}
            project={project}
            onClick={() => setSelectedProject(project)}
          />
        ))}
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
