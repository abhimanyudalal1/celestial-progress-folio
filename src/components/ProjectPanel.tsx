import { useEffect, useRef } from "react";
import { X, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
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
        className="fixed inset-0 backdrop-blur-sm z-[100] animate-in fade-in cursor-pointer"
        style={{
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          transition: 'background-color 0.5s ease'
        }}
        onClick={(e) => {
          console.log('Backdrop clicked'); // Debug log
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
          backgroundColor: isDarkMode ? '#1a1a1a' : 'white',
          borderLeftColor: isDarkMode ? '#333333' : '#e5e7eb',
          transition: 'background-color 0.5s ease, border-color 0.5s ease'
        }}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h2 
                id="panel-title" 
                className="text-2xl font-bold" 
                style={{ 
                  color: isDarkMode ? '#e5e5e5' : '#1f2937',
                  transition: 'color 0.5s ease'
                }}
              >
                {project.title}
              </h2>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    background: isDarkMode 
                      ? `radial-gradient(circle at 30% 30%, hsl(0 0% 30% / 0.8), hsl(0 0% 20%))`
                      : `radial-gradient(circle at 30% 30%, hsl(${project.accentColor} / 0.8), hsl(${project.accentColor}))`,
                    boxShadow: isDarkMode 
                      ? '0 0 20px rgba(0, 0, 0, 0.4)'
                      : `0 0 20px hsl(${project.accentColor} / 0.4)`,
                    transition: 'background 0.5s ease, box-shadow 0.5s ease'
                  }}
                >
                  <span className="text-white drop-shadow-md">
                    {project.completionPercent}%
                  </span>
                </div>
                <div>
                  <p 
                    className="text-sm font-semibold" 
                    style={{ 
                      color: isDarkMode ? '#e5e5e5' : '#1f2937',
                      transition: 'color 0.5s ease'
                    }}
                  >
                    Project Progress
                  </p>
                  <p 
                    className="text-xs font-medium" 
                    style={{ 
                      color: isDarkMode ? '#a3a3a3' : '#4b5563',
                      transition: 'color 0.5s ease'
                    }}
                  >
                    {project.completionPercent}% Complete
                  </p>
                </div>
              </div>
            </div>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="pointer-events-auto z-50"
              style={{ 
                color: isDarkMode ? '#e5e5e5' : '#1f2937',
                transition: 'color 0.5s ease'
              }}
              aria-label="Close project details"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide" 
              style={{ 
                color: isDarkMode ? '#a3a3a3' : '#6b7280',
                transition: 'color 0.5s ease'
              }}
            >
              Description
            </h3>
            <p 
              className="font-medium leading-relaxed" 
              style={{ 
                color: isDarkMode ? '#d4d4d4' : '#1f2937',
                transition: 'color 0.5s ease'
              }}
            >
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide" 
              style={{ 
                color: isDarkMode ? '#a3a3a3' : '#6b7280',
                transition: 'color 0.5s ease'
              }}
            >
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 
              className="text-sm font-semibold uppercase tracking-wide" 
              style={{ 
                color: isDarkMode ? '#a3a3a3' : '#6b7280',
                transition: 'color 0.5s ease'
              }}
            >
              Links
            </h3>
            <div className="flex flex-col gap-3">
              {project.links.github && (
                <GradientButton
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </a>
                </GradientButton>
              )}
              {project.links.live && (
                <GradientButton
                  variant="variant"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Live Demo
                  </a>
                </GradientButton>
              )}
            </div>
          </div>

          {/* Progress Details */}
          <div 
            className="p-4 rounded-lg space-y-2" 
            style={{ 
              backgroundColor: isDarkMode ? '#262626' : '#f3f4f6',
              transition: 'background-color 0.5s ease'
            }}
          >
            <h3 
              className="text-sm font-semibold" 
              style={{ 
                color: isDarkMode ? '#e5e5e5' : '#1f2937',
                transition: 'color 0.5s ease'
              }}
            >
              Development Status
            </h3>
            <div 
              className="w-full rounded-full h-2 overflow-hidden" 
              style={{ 
                backgroundColor: isDarkMode ? '#404040' : '#e5e7eb',
                transition: 'background-color 0.5s ease'
              }}
            >
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${project.completionPercent}%`,
                  background: isDarkMode 
                    ? 'linear-gradient(90deg, hsl(0 0% 30%), hsl(0 0% 20%))'
                    : `hsl(${project.accentColor})`,
                  boxShadow: isDarkMode 
                    ? '0 0 10px rgba(0, 0, 0, 0.5)'
                    : `0 0 10px hsl(${project.accentColor} / 0.5)`,
                }}
              />
            </div>
            <p 
              className="text-xs font-medium" 
              style={{ 
                color: isDarkMode ? '#a3a3a3' : '#4b5563',
                transition: 'color 0.5s ease'
              }}
            >
              {project.completionPercent === 100
                ? "Project completed and deployed!"
                : `${100 - project.completionPercent}% remaining to completion`}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProjectPanel;
