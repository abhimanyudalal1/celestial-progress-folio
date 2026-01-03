import { useEffect, useRef } from "react";
import { X, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanetProject } from "./Planet";
import { useTheme } from "@/contexts/ThemeContext";

interface ProjectPanelProps {
  project: PlanetProject;
  onClose: () => void;
}

const ProjectPanel = ({ project, onClose }: ProjectPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { isDarkMode } = useTheme();

  // Helper for theme colors
  const { accentColor, orbitIndex } = project;

  // Distinct Grey/Black Shades for Dark Mode (Matching DiagonalProjectCard)
  const GREY_SHADES = [
    '#1c1917', // Stone-900
    '#111827', // Gray-900
    '#27272a', // Zinc-900
    '#323232', // Neutral Dark Grey
    '#262626', // Neutral-800
  ];

  // In Night Mode, override to specific grey shade
  // orbitIndex is 1-based usually, so we subtract 1 for array index
  const themeColor = isDarkMode
    ? GREY_SHADES[(orbitIndex - 1) % GREY_SHADES.length] || '#cfd8dc'
    : `hsl(${accentColor})`;

  const themeColorAlpha = (alpha: number) => {
    if (isDarkMode) {
      // Need to convert hex to rgba for alpha support or just use opacity if possible?
      // Since we want alpha on these hexes, let's just use the themeColor hex 
      // providing it's a valid hex, but `rgba` needs r,g,b.

      // Simple Hex to RGB conversion for the alpha helper
      const hex = themeColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `hsl(${accentColor} / ${alpha})`;
  };

  useEffect(() => {
    // Focus close button when panel opens
    closeButtonRef.current?.focus();

    // Trap focus within panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Tab") {
        const focusableElements = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] animate-in fade-in cursor-pointer"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          transition: 'background-color 0.5s ease'
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full sm:w-[500px] border-l shadow-2xl z-[101] overflow-y-auto animate-slide-in-right pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          // Glassmorphism background using the planet's accent color
          backgroundColor: isDarkMode ? '#1a1a1a' : `rgba(15, 15, 20, 0.95)`,
          // Use dark background even in "light" (colorful) mode to make the colors pop, or maybe adjust opacity
          backgroundImage: `linear-gradient(to bottom right, ${themeColorAlpha(0.1)}, rgba(0,0,0,0.8))`,
          borderLeft: `1px solid ${themeColorAlpha(0.3)}`,
          boxShadow: `-10px 0 30px ${themeColorAlpha(0.1)}`,
        }}
      >
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2"
                style={{
                  backgroundColor: themeColorAlpha(0.1),
                  color: themeColor,
                  border: `1px solid ${themeColorAlpha(0.2)}`
                }}
              >
                Project Details
              </div>
              <h2
                id="panel-title"
                className="text-3xl font-bold leading-tight"
                style={{
                  color: 'white',
                  textShadow: `0 0 20px ${themeColorAlpha(0.3)}`
                }}
              >
                {project.title}
              </h2>
            </div>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="pointer-events-auto z-50 hover:bg-white/10 text-white/70 hover:text-white"
              aria-label="Close project details"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Progress Section */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                boxShadow: `0 0 25px ${themeColorAlpha(0.2)}`
              }}
            >
              {/* Ring SVGs */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="32" cy="32" r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-white/10"
                />
                <circle
                  cx="32" cy="32" r="28"
                  stroke={themeColor}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={175} // 2 * pi * 28 ≈ 175.9
                  strokeDashoffset={175 - (175 * project.completionPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="text-white">{project.completionPercent}%</span>
            </div>
            <div>
              <p className="text-white font-medium text-lg">Development Status</p>
              <p className="text-gray-400 text-sm">
                {project.completionPercent === 100
                  ? "Completed & Deployed"
                  : "Work in Progress"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3
              className="text-sm font-bold uppercase tracking-widest text-gray-500"
            >
              About
            </h3>
            <p
              className="text-gray-300 text-lg leading-relaxed font-light"
            >
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h3
              className="text-sm font-bold uppercase tracking-widest text-gray-500"
            >
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: themeColorAlpha(0.1),
                    color: themeColor,
                    border: `1px solid ${themeColorAlpha(0.2)}`
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3 pt-4">
            <div className="flex flex-col gap-3">
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Github className="w-5 h-5" />
                  View Source Code
                </a>
              )}
              {project.links.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                  style={{
                    backgroundColor: themeColor,
                    boxShadow: `0 8px 20px -5px ${themeColorAlpha(0.4)}`
                  }}
                >
                  <ExternalLink className="w-5 h-5" />
                  Launch Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Decorative Bottom Gradient */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${themeColorAlpha(0.15)}, transparent)`
            }}
          />
        </div>
      </aside>
    </>
  );
};

export default ProjectPanel;
