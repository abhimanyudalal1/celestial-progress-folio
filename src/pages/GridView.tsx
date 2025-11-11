import { useState } from "react";
import { PlanetProject } from "@/components/Planet";
import ProjectPanel from "@/components/ProjectPanel";
import { MiniNavbar } from "@/components/ui/mini-navbar";

// Sample projects data - same as in SolarSystem
const projects: PlanetProject[] = [
  {
    id: "1",
    title: "Human-AI interaction",
    description: "Developed a real-time multi-modal pipeline combining computer vision (OpenCV, MediaPipe for human pose estimation) and NLP (Whisper ASR), achieving 85% classification accuracy.",
    stack: ["React", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
    completionPercent: 75,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "200 65% 55%",
    orbitIndex: 1,
    planetImage: 1, // Using planet1.svg
  },
  {
    id: "2",
    title: "Land Use and Land Cover Classification",
    description: "A collaborative project management tool with drag-and-drop functionality, real-time updates via WebSockets, and team collaboration features.",
    stack: ["TypeScript", "Next.js", "Prisma", "Socket.io", "shadcn/ui"],
    completionPercent: 32,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "280 70% 60%",
    orbitIndex: 2,
    planetImage: 2, // Using planet2.svg
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
    planetImage: 3, // Using planet3.svg
  },
  {
    id: "4",
    title: "Weather Dashboard",
    description: "A beautiful weather forecasting dashboard with interactive maps, hourly predictions, and location-based alerts. Built with modern design patterns.",
    stack: ["Vue.js", "D3.js", "OpenWeather API", "CSS Grid"],
    completionPercent: 50,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "15 85% 55%",
    orbitIndex: 4,
    planetImage: 1, // Using planet1.svg (reusing)
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
    planetImage: 2, // Using planet2.svg (reusing)
  },
];

const GridView = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);

  return (
    <div className="min-h-screen relative bg-white">
      {/* Navigation Bar */}
      <MiniNavbar />
      
      {/* Grid Lines Background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 pt-24 pb-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">My Projects</h1>
          <p className="text-gray-600 text-lg">Clean.</p>
        </div>
      </header>

      {/* Projects Grid - 2 columns */}
      <main className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-8 cursor-pointer hover:shadow-xl hover:border-gray-900 transition-all duration-300 hover:scale-[1.02]"
                onClick={() => setSelectedProject(project)}
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900 group-hover:underline">
                      {project.title}
                    </h2>
                  </div>
                  
                  {/* Monochromatic Icon */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 ml-4 bg-gray-100 border-2 border-gray-300 group-hover:border-gray-900 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gray-900" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.stack.map((tech, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1.5 text-sm rounded-full font-medium bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  {project.links.github && (
                    <a 
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {project.links.live && (
                    <a 
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Project Details Panel */}
      {selectedProject && (
        <ProjectPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default GridView;
