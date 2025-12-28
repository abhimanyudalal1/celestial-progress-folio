import { motion } from 'framer-motion';
import { projects, PLANET_THEMES } from '@/data/projects';
import { ProjectCard } from './ProjectCard';

interface ProjectsGridProps {
  className?: string;
}

export const ProjectsGrid = ({ className = '' }: ProjectsGridProps) => {
  return (
    <section className={`relative ${className}`}>
      {/* Background gradient orbs for atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Object.values(PLANET_THEMES).map((color, i) => (
          <div
            key={color}
            className="absolute rounded-full blur-[100px] opacity-10"
            style={{
              background: color,
              width: '400px',
              height: '400px',
              left: `${(i * 25) % 100}%`,
              top: `${(i * 30) % 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Section Header */}
      <motion.div 
        className="relative text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
          My Projects
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Each project is a planet in my creative solar system — click to explore the universe of my work.
        </p>
        
        {/* Planet color legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: `${project.themeColor}15`,
                border: `1px solid ${project.themeColor}40`,
              }}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ background: project.themeColor }}
              />
              <span style={{ color: project.themeColor }}>{project.planetType}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            index={index}
          />
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      <div className="absolute top-1/2 right-0 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
    </section>
  );
};

export default ProjectsGrid;
