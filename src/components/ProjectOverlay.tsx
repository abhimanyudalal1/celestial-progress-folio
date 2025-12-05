import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { PlanetProject } from "./Planet";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Github, ExternalLink } from "lucide-react";

interface ProjectOverlayProps {
    project: PlanetProject;
    initialRect: DOMRect;
    onClose: () => void;
}

const ProjectOverlay = ({ project, initialRect, onClose }: ProjectOverlayProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const { isDarkMode } = useTheme();
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial state - match the planet's position and size
            gsap.set(overlayRef.current, {
                position: "fixed",
                top: initialRect.top,
                left: initialRect.left,
                width: initialRect.width,
                height: initialRect.height,
                borderRadius: "50%",
                opacity: 1,
                zIndex: 100,
                backgroundColor: isDarkMode ? "rgba(10, 10, 20, 0.95)" : "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(100, 200, 255, 0.3)",
                boxShadow: "0 0 20px rgba(100, 200, 255, 0.2)",
            });

            gsap.set(contentRef.current, {
                opacity: 0,
                y: 20
            });

            const tl = gsap.timeline({
                onComplete: () => setIsAnimating(false)
            });

            // Animate to full width box
            tl.to(overlayRef.current, {
                top: "15%",
                left: "5%",
                width: "90%",
                height: "70%",
                borderRadius: "16px",
                duration: 0.6,
                ease: "power3.inOut"
            })
                // Fade in content
                .to(contentRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                }, "-=0.2");

        }, overlayRef);

        return () => ctx.revert();
    }, [initialRect, isDarkMode]);

    const handleClose = () => {
        if (isAnimating) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: onClose
            });

            tl.to(contentRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: "power2.in"
            })
                .to(overlayRef.current, {
                    top: initialRect.top,
                    left: initialRect.left,
                    width: initialRect.width,
                    height: initialRect.height,
                    borderRadius: "50%",
                    duration: 0.5,
                    ease: "power3.inOut"
                }, "-=0.1");
        }, overlayRef);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-500"
                onClick={handleClose}
                style={{ animation: "fadeIn 0.5s ease-out forwards" }}
            />

            {/* Animated Overlay */}
            <div ref={overlayRef} className="overflow-hidden flex flex-col">
                <div ref={contentRef} className="flex flex-col h-full p-8 relative">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-black/10 text-black"
                            }`}
                    >
                        <X size={24} />
                    </button>

                    {/* Header */}
                    <div className="mb-8 border-b border-gray-200/20 pb-6">
                        <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {project.title}
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {project.stack.map((tech) => (
                                <span
                                    key={tech}
                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${isDarkMode
                                            ? "bg-white/5 border-white/10 text-cyan-300"
                                            : "bg-black/5 border-black/10 text-cyan-700"
                                        }`}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow overflow-y-auto custom-scrollbar">
                        {/* Left Column: Description */}
                        <div className="space-y-6">
                            <div>
                                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    About the Project
                                </h3>
                                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    {project.description}
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                {project.links.github && (
                                    <a
                                        href={project.links.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${isDarkMode
                                                ? "bg-white/10 hover:bg-white/20 text-white"
                                                : "bg-black/5 hover:bg-black/10 text-gray-900"
                                            }`}
                                    >
                                        <Github size={20} />
                                        View Code
                                    </a>
                                )}
                                {project.links.live && (
                                    <a
                                        href={project.links.live}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-cyan-500 hover:bg-cyan-600 text-white transition-all shadow-lg shadow-cyan-500/20"
                                    >
                                        <ExternalLink size={20} />
                                        Live Demo
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Stats or Image (Placeholder for now) */}
                        <div className={`rounded-xl p-6 border ${isDarkMode ? "bg-black/20 border-white/10" : "bg-gray-50 border-gray-200"
                            }`}>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Project Metrics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-white shadow-sm"}`}>
                                    <div className="text-sm text-gray-500 mb-1">Completion</div>
                                    <div className="text-2xl font-bold text-cyan-400">{project.completionPercent}%</div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-white shadow-sm"}`}>
                                    <div className="text-sm text-gray-500 mb-1">Orbit</div>
                                    <div className="text-2xl font-bold text-purple-400">Layer {project.orbitIndex}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
        </>
    );
};

export default ProjectOverlay;
