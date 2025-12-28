import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ChevronRight } from 'lucide-react';
import { Project } from '@/data/projects';

interface DiagonalProjectCardProps {
  project: Project;
  index: number;
  totalProjects: number;
  expandedIndex: number | null;
  onExpand: (index: number | null) => void;
}

// Background images for each planet type
const PLANET_BACKGROUNDS: Record<string, string | null> = {
  lava: '/lavaa.png',
  cracked: null,
  terran: null,
  ringed: null,
  ice: null,
};

export const DiagonalProjectCard = ({ 
  project, 
  index, 
  totalProjects,
  expandedIndex,
  onExpand,
}: DiagonalProjectCardProps) => {
  const { themeColor } = project;
  const [isHovered, setIsHovered] = useState(false);
  
  const isExpanded = expandedIndex === index;
  const hasExpanded = expandedIndex !== null;
  
  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Calculate widths based on state
  const defaultWidth = 100 / totalProjects;
  const expandedWidth = 75;
  const collapsedWidth = 25 / (totalProjects - 1);
  
  // Calculate left position
  const getLeftPosition = () => {
    if (!hasExpanded) {
      return index * defaultWidth;
    }
    
    if (isExpanded) {
      return index * collapsedWidth;
    }
    
    if (expandedIndex !== null && index < expandedIndex) {
      return index * collapsedWidth;
    }
    
    // Cards after expanded
    if (expandedIndex !== null) {
      return expandedWidth + (index - expandedIndex - 1) * collapsedWidth + collapsedWidth;
    }
    
    return index * defaultWidth;
  };

  // Calculate width
  const getWidth = () => {
    if (!hasExpanded) {
      return defaultWidth + 3; // Slight overlap
    }
    return isExpanded ? expandedWidth : collapsedWidth + 2;
  };

  const leftPosition = getLeftPosition();
  const width = getWidth();
  
  // Skew angle for diagonal effect
  const skewAngle = -12;
  
  // Background image
  const backgroundImage = PLANET_BACKGROUNDS[project.planetType];

  const handleClick = () => {
    if (isExpanded) {
      onExpand(null);
    } else {
      onExpand(index);
    }
  };

  return (
    <motion.div
      className="fixed top-0 bottom-0 cursor-pointer overflow-hidden"
      style={{
        zIndex: isExpanded ? 30 : isHovered ? 25 : 10 + index,
      }}
      initial={{ 
        left: `${index * defaultWidth}%`,
        width: `${defaultWidth + 3}%`,
        opacity: 0,
        x: '100%',
      }}
      animate={{ 
        left: `${leftPosition}%`,
        width: `${width}%`,
        opacity: 1,
        x: 0,
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1],
        delay: hasExpanded ? 0 : index * 0.08,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Skewed background container */}
      <motion.div
        className="absolute inset-0 origin-center"
        style={{
          transform: `skewX(${skewAngle}deg)`,
          marginLeft: '-15%',
          marginRight: '-15%',
        }}
        animate={{
          scale: isHovered && !isExpanded ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: isExpanded 
              ? `linear-gradient(135deg, ${hexToRgba(themeColor, 0.95)} 0%, ${hexToRgba(themeColor, 0.6)} 30%, rgba(10,10,10,0.98) 70%)`
              : `linear-gradient(135deg, ${hexToRgba(themeColor, 0.85)} 0%, ${hexToRgba(themeColor, 0.4)} 50%, ${hexToRgba(themeColor, 0.15)} 100%)`,
          }}
        />
        
        {/* Background image if available */}
        {backgroundImage && (
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'overlay',
            }}
            animate={{
              opacity: isExpanded ? 0.3 : 0.4,
            }}
          />
        )}

        {/* Animated glow on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: isHovered || isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: `linear-gradient(135deg, transparent 0%, ${hexToRgba(themeColor, 0.2)} 50%, transparent 100%)`,
            boxShadow: `inset 0 0 100px ${hexToRgba(themeColor, 0.2)}`,
          }}
        />

        {/* Vertical divider line */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background: `linear-gradient(to bottom, transparent, ${themeColor}, transparent)`,
          }}
        />
      </motion.div>

      {/* Content container (un-skewed) */}
      <div className="absolute inset-0 flex">
        {/* Collapsed state content - vertical title */}
        <motion.div 
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-2"
          animate={{
            opacity: isExpanded ? 0 : 1,
            x: isExpanded ? -50 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: isExpanded ? 'none' : 'auto' }}
        >
          {/* Planet indicator */}
          <motion.div
            className="mb-4"
            animate={{ y: isHovered ? -5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-2"
              style={{ 
                background: themeColor,
                boxShadow: `0 0 15px ${themeColor}`,
                animation: 'pulse 2s infinite',
              }}
            />
            <span 
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: hexToRgba('#fff', 0.6) }}
            >
              {project.planetType}
            </span>
          </motion.div>

          {/* Title - vertical */}
          <motion.h3 
            className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              textShadow: `0 0 30px ${hexToRgba(themeColor, 0.6)}`,
              maxHeight: '60vh',
            }}
            animate={{ 
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            {project.title}
          </motion.h3>

          {/* Expand indicator */}
          <motion.div
            className="mt-4"
            animate={{ 
              opacity: isHovered ? 1 : 0.4,
              x: isHovered ? 3 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight 
              size={20} 
              className="text-white"
              style={{ filter: `drop-shadow(0 0 8px ${themeColor})` }}
            />
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
            animate={{ opacity: isHovered ? 1 : 0.5 }}
          >
            <div 
              className="text-[10px] font-bold mb-1"
              style={{ color: themeColor }}
            >
              {project.completionPercent}%
            </div>
            <div 
              className="w-8 h-0.5 rounded-full overflow-hidden"
              style={{ background: hexToRgba(themeColor, 0.3) }}
            >
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${project.completionPercent}%`,
                  background: themeColor,
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Expanded state content */}
        <motion.div 
          className="absolute inset-0 flex items-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isExpanded ? 1 : 0,
            x: isExpanded ? 0 : 100,
          }}
          transition={{ duration: 0.4, delay: isExpanded ? 0.1 : 0 }}
          style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
        >
          <div className="w-full h-full flex items-center px-8 md:px-12 lg:px-16 py-12">
            <div className="max-w-xl">
              {/* Planet badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: hexToRgba(themeColor, 0.2),
                  border: `1px solid ${themeColor}`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 20 }}
                transition={{ delay: 0.15 }}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: themeColor, animation: 'pulse 2s infinite' }}
                />
                <span style={{ color: themeColor }} className="text-sm font-semibold uppercase tracking-wider">
                  {project.planetType} Planet
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.2 }}
                style={{
                  textShadow: `0 0 40px ${hexToRgba(themeColor, 0.4)}`,
                }}
              >
                {project.title}
              </motion.h1>

              {/* Description */}
              <motion.p 
                className="text-gray-300 text-sm md:text-base leading-relaxed mb-4 line-clamp-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.25 }}
              >
                {project.description}
              </motion.p>

              {/* Tech Stack */}
              <motion.div 
                className="flex flex-wrap gap-2 mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.3 }}
              >
                {project.techStack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{
                      background: hexToRgba(themeColor, 0.15),
                      color: themeColor,
                      border: `1px solid ${hexToRgba(themeColor, 0.3)}`,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </motion.div>

              {/* Progress */}
              <motion.div 
                className="mb-5 max-w-xs"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.35 }}
              >
                <div className="flex justify-between mb-1.5">
                  <span className="text-gray-400 text-xs">Progress</span>
                  <span style={{ color: themeColor }} className="font-bold text-xs">
                    {project.completionPercent}%
                  </span>
                </div>
                <div 
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: hexToRgba(themeColor, 0.2) }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: themeColor }}
                    initial={{ width: 0 }}
                    animate={{ width: isExpanded ? `${project.completionPercent}%` : 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div 
                className="flex gap-3 flex-wrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.4 }}
              >
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      border: `2px solid ${themeColor}`,
                      color: themeColor,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github size={16} />
                    Code
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
                    style={{
                      background: themeColor,
                      color: '#000',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} />
                    Demo
                  </a>
                )}
              </motion.div>

              {/* Click hint */}
              <motion.p
                className="text-gray-500 text-[10px] mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 0.7 : 0 }}
                transition={{ delay: 0.5 }}
              >
                Click to collapse
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DiagonalProjectCard;
