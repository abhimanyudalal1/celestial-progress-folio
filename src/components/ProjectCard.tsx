import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const { themeColor } = project;
  
  // Convert hex to rgba for transparent backgrounds
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Background image for lava planet (project 1)
  const backgroundImage = project.planetType === 'lava' ? '/lavaa.png' : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${themeColor}`,
      }}
    >
      {/* Background image for lava planet */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.99,
          }}
        />
      )}
      
      {/* Dark overlay for readability */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
          }}
        />
      )}

      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
        style={{
          boxShadow: `0 0 40px ${hexToRgba(themeColor, 0.3)}, inset 0 0 60px ${hexToRgba(themeColor, 0.05)}`,
        }}
      />
      
      {/* Top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
        }}
      />

      {/* Card Content */}
      <div className="relative p-6 space-y-4 z-10">
        {/* Header with planet indicator */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Planet type indicator */}
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
              style={{
                background: hexToRgba(themeColor, 0.15),
                color: themeColor,
                border: `1px solid ${hexToRgba(themeColor, 0.3)}`,
              }}
            >
              <span 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: themeColor }}
              />
              {project.planetType.charAt(0).toUpperCase() + project.planetType.slice(1)} Planet
            </div>
            
            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-opacity-100 transition-colors break-words whitespace-normal">
              {project.title}
            </h3>
          </div>
          
          {/* Completion indicator 
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-full text-xs font-bold"
            style={{
              background: hexToRgba(themeColor, 0.2),
              border: `2px solid ${themeColor}`,
              color: themeColor,
            }}
          >
            {project.completionPercent}%
          </div>
          */}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: hexToRgba(themeColor, 0.15),
                color: themeColor,
                border: `1px solid ${hexToRgba(themeColor, 0.25)}`,
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Progress Bar 
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Progress</span>
            <span style={{ color: themeColor }}>{project.completionPercent}%</span>
          </div>
          <div 
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: hexToRgba(themeColor, 0.2) }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: themeColor }}
              initial={{ width: 0 }}
              animate={{ width: `${project.completionPercent}%` }}
              transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
        */}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                border: `1px solid ${themeColor}`,
                color: themeColor,
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = hexToRgba(themeColor, 0.15);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Github size={16} />
              GitHub
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: themeColor,
                color: '#000',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} />
              Live Demo
            </a>
          )}
        </div>
      </div>

      {/* Bottom glow line on hover */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
        }}
      />
    </motion.div>
  );
};

export default ProjectCard;
