import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ChevronRight } from 'lucide-react';
import { Project } from '@/data/projects';
import { useTheme } from '@/contexts/ThemeContext';

interface DiagonalProjectCardProps {
  project: Project;
  index: number;
  totalProjects: number;
  expandedIndex: number | null;
  onExpand: (index: number | null) => void;
}

// Planet spritesheets (50 cols × 3 rows) — same art as the solar system hero
const PLANET_SPRITES: Record<string, { light: string; dark: string }> = {
  lava: { light: '/Lava%20World%20-%201909546053%20-%20spritesheet.png', dark: '/Islands%20-%20330873532%20-%20spritesheetdark.png' },
  cracked: { light: '/Gas%20giant%201%20-%203542928846%20-%20spritesheet.png', dark: '/Gas%20giant%202%20-%20330873532%20-%20spritesheetdark.png' },
  terran: { light: '/Terran%20Wet%20-%203542928846%20-%20spritesheet.png', dark: '/Terran%20Wet%20-%20330873532%20-%20spritesheetdark.png' },
  ringed: { light: '/Terran%20Dry%20-%203542928846%20-%20spritesheet.png', dark: '/Terran%20Dry%20-%20330873532%20-%20spritesheetdark.png' },
  ice: { light: '/Ice%20World%20-%201909546053%20-%20spritesheet.png', dark: '/Ice%20World%20-%20330873532%20-%20spritesheetdark.png' },
};

// Static first frame of a planet spritesheet, rendered as a circle
const PlanetSprite = ({ type, size, isDarkMode, glow }: {
  type: string; size: number; isDarkMode: boolean; glow?: string;
}) => {
  const sprite = PLANET_SPRITES[type];
  if (!sprite) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundImage: `url('${isDarkMode ? sprite.dark : sprite.light}')`,
        backgroundSize: `${size * 50}px ${size * 3}px`,
        backgroundPosition: '0px 0px',
        backgroundRepeat: 'no-repeat',
        boxShadow: glow,
      }}
    />
  );
};

export const DiagonalProjectCard = ({
  project,
  index,
  totalProjects,
  expandedIndex,
  onExpand,
}: DiagonalProjectCardProps) => {
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Distinct charcoal shades for the strict-mono dark mode panels
  const GREY_SHADES = ['#1c1917', '#111827', '#27272a', '#323232', '#262626'];

  // Panel background vs accent are separate: in dark (mono) mode the accent is
  // white so labels/chips/buttons stay readable on the charcoal panel — the old
  // design tinted them in the panel's own color and they vanished.
  const panelColor = isDarkMode ? GREY_SHADES[index % GREY_SHADES.length] : '#0a0a0a';
  const accent = isDarkMode ? '#ffffff' : project.themeColor;

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

    // Cards after expanded: expanded card width + all collapsed cards before this one
    if (expandedIndex !== null) {
      return expandedWidth + (index - 1) * collapsedWidth;
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

  const handleClick = () => {
    onExpand(isExpanded ? null : index);
  };

  return (
    <motion.div
      className="fixed top-0 bottom-0 cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
      style={{
        zIndex: isExpanded ? 30 : isHovered ? 25 : 10 + index,
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`${project.title} — ${isExpanded ? 'collapse' : 'expand'} project details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
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
        {/* Panel: deep space tinted toward the planet's accent at the base */}
        <div
          className="absolute inset-0"
          style={{
            background: isDarkMode
              ? panelColor
              : `linear-gradient(170deg, #050505 0%, #0b0b0d 45%, ${hexToRgba(project.themeColor, 0.34)} 135%)`,
          }}
        />

        {/* Faint starfield texture via radial dots (kept subtle for smooth paint) */}
        <div
          className="absolute inset-0 opacity-[0.22] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.5)'} 1px, transparent 1px)`,
            backgroundSize: '46px 46px',
          }}
        />

        {/* Accent glow that breathes in on hover / expand */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: isHovered || isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `linear-gradient(135deg, transparent 0%, ${hexToRgba(accent, isDarkMode ? 0.08 : 0.16)} 50%, transparent 100%)`,
            boxShadow: `inset 0 0 120px ${hexToRgba(accent, isDarkMode ? 0.06 : 0.18)}`,
          }}
        />

        {/* Accent divider between sectors */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background: `linear-gradient(to bottom, transparent, ${hexToRgba(accent, 0.8)}, transparent)`,
          }}
        />
      </motion.div>

      {/* Content container (un-skewed) */}
      <div className="absolute inset-0 flex">
        {/* Collapsed state content */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-3"
          animate={{
            opacity: isExpanded ? 0 : 1,
            x: isExpanded ? -50 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: isExpanded ? 'none' : 'auto' }}
        >
          {/* Planet + sector label */}
          <motion.div
            className="mb-5 flex flex-col items-center gap-3"
            animate={{ y: isHovered ? -6 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <PlanetSprite
              type={project.planetType}
              size={hasExpanded ? 44 : 64}
              isDarkMode={isDarkMode}
              glow={`0 0 ${isHovered ? 42 : 26}px ${hexToRgba(accent, isDarkMode ? 0.25 : 0.5)}`}
            />
            <span
              className="font-mono text-[10px] font-medium uppercase tracking-[0.3em]"
              style={{ color: hexToRgba(accent, 0.75) }}
            >
              0{index + 1}
            </span>
          </motion.div>

          {/* Title — vertical when another sector is expanded */}
          <motion.h3
            className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight"
            style={{
              writingMode: hasExpanded ? 'vertical-rl' : 'horizontal-tb',
              textOrientation: 'mixed',
              transform: hasExpanded ? 'rotate(180deg)' : 'none',
              textShadow: `0 0 30px ${hexToRgba(accent, isDarkMode ? 0.3 : 0.55)}`,
              maxHeight: hasExpanded ? '60vh' : 'auto',
              maxWidth: hasExpanded ? '100%' : '200px',
              whiteSpace: 'normal',
              textWrap: 'balance' as never,
            }}
            animate={{ scale: isHovered ? 1.04 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {project.title}
          </motion.h3>

          {/* Expand indicator */}
          <motion.div
            className="mt-5"
            animate={{
              opacity: isHovered ? 1 : 0.4,
              x: isHovered ? 3 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight
              size={18}
              className="text-white"
              style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(accent, 0.8)})` }}
            />
          </motion.div>
        </motion.div>

        {/* Expanded state content — mirrors the home tour's mission-log cards */}
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
          <div className="w-full h-full flex items-center justify-between gap-8 px-8 md:px-14 lg:px-20 py-12">
            <div className="max-w-xl">
              {/* Mission-log kicker */}
              <motion.p
                className="font-mono text-xs md:text-sm font-semibold uppercase tracking-[0.35em] mb-5"
                style={{ color: isDarkMode ? 'rgba(255,255,255,0.65)' : project.themeColor }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 20 }}
                transition={{ delay: 0.15 }}
              >
                Orbit 0{index + 1} <span className="opacity-50">/ 0{totalProjects}</span>
              </motion.p>

              {/* Title */}
              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-5"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.2 }}
                style={{ textShadow: `0 0 40px ${hexToRgba(accent, isDarkMode ? 0.2 : 0.35)}` }}
              >
                {project.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                className="text-sm md:text-base lg:text-lg font-light leading-relaxed mb-6 line-clamp-4 text-white/70"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.25 }}
              >
                {project.description}
              </motion.p>

              {/* Tech Stack */}
              <motion.div
                className="flex flex-wrap gap-2 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.3 }}
              >
                {project.techStack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs md:text-sm border rounded-full text-white/90 bg-white/10 border-white/20"
                  >
                    {tech}
                  </span>
                ))}
              </motion.div>

              {/* Action buttons — same pills as the tour cards */}
              <motion.div
                className="flex gap-4 flex-wrap items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 30 }}
                transition={{ delay: 0.4 }}
              >
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm md:text-base text-white border border-white/25 bg-white/5 transition-all hover:bg-white/10 hover:scale-105"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github size={18} />
                    Repository
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm md:text-base transition-all hover:scale-105"
                    style={{
                      background: accent,
                      color: '#000',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={18} />
                    Open Project
                  </a>
                )}
              </motion.div>

              {/* Collapse hint */}
              <motion.p
                className="font-mono text-[10px] uppercase tracking-[0.3em] mt-8 text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ delay: 0.5 }}
              >
                Click anywhere to collapse · Esc
              </motion.p>
            </div>

            {/* Right side intentionally left blank — reserved for project media
                (screenshots / videos) to be added later */}
            <div className="hidden md:block shrink-0 w-[260px]" aria-hidden="true" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DiagonalProjectCard;
