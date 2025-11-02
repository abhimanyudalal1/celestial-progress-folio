import { useEffect, useRef } from "react";
import { X, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanetProject } from "./Planet";

interface ProjectPanelProps {
  project: PlanetProject;
  onClose: () => void;
}

const ProjectPanel = ({ project, onClose }: ProjectPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-card border-l border-border shadow-2xl z-50 overflow-y-auto animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h2 id="panel-title" className="text-2xl font-bold">
                {project.title}
              </h2>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, hsl(${project.accentColor} / 0.8), hsl(${project.accentColor}))`,
                    boxShadow: `0 0 20px hsl(${project.accentColor} / 0.4)`,
                  }}
                >
                  <span className="text-white drop-shadow-md">
                    {project.completionPercent}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Project Progress</p>
                  <p className="text-xs text-muted-foreground">
                    {project.completionPercent}% Complete
                  </p>
                </div>
              </div>
            </div>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close project details"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h3>
            <p className="text-foreground leading-relaxed">{project.description}</p>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Links
            </h3>
            <div className="flex flex-col gap-3">
              {project.links.github && (
                <Button
                  variant="outline"
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
                </Button>
              )}
              {project.links.live && (
                <Button
                  variant="default"
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
                </Button>
              )}
            </div>
          </div>

          {/* Progress Details */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="text-sm font-semibold">Development Status</h3>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${project.completionPercent}%`,
                  background: `hsl(${project.accentColor})`,
                  boxShadow: `0 0 10px hsl(${project.accentColor} / 0.5)`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
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
