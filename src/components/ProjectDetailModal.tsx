import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, ExternalLink, Check } from "lucide-react";
import { Project } from "@/data/projects";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal = ({ project, onClose }: ProjectDetailModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (project) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [project, onClose]);

  if (!project) return null;

  const { themeColor } = project;

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] cursor-pointer"
            style={{
              background: `radial-gradient(circle at center, ${hexToRgba(themeColor, 0.1)} 0%, rgba(0,0,0,0.9) 100%)`,
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] z-[101] overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(10, 10, 10, 0.95)',
              border: `2px solid ${themeColor}`,
              boxShadow: `0 0 60px ${hexToRgba(themeColor, 0.3)}`,
            }}
          >
            {/* Top accent gradient */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: themeColor }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                background: hexToRgba(themeColor, 0.2),
                border: `1px solid ${hexToRgba(themeColor, 0.4)}`,
              }}
            >
              <X size={20} style={{ color: themeColor }} />
            </button>

            {/* Content */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-2rem)] md:max-h-[85vh]">
              {/* Header */}
              <div className="mb-6">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
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

                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                  {project.title}
                </h2>

                {/* Progress bar 
                <div className="flex items-center gap-4 mt-4">
                  <div 
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: hexToRgba(themeColor, 0.2) }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: themeColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${project.completionPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <span 
                    className="text-sm font-bold"
                    style={{ color: themeColor }}
                  >
                    {project.completionPercent}%
                  </span>
                </div>
                */}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tech Stack */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Technology Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                      style={{
                        background: hexToRgba(themeColor, 0.15),
                        color: themeColor,
                        border: `1px solid ${hexToRgba(themeColor, 0.25)}`,
                      }}
                    >
                      <Check size={14} />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-800">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      border: `2px solid ${themeColor}`,
                      color: themeColor,
                      background: 'transparent',
                    }}
                  >
                    <Github size={20} />
                    View on GitHub
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: themeColor,
                      color: '#000',
                    }}
                  >
                    <ExternalLink size={20} />
                    Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Bottom glow */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background: `linear-gradient(to top, ${hexToRgba(themeColor, 0.1)}, transparent)`,
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailModal;
