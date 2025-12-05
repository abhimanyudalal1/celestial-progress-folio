import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import "./PlanetSplit.css";
import { useTheme } from "@/contexts/ThemeContext";

export interface PlanetProject {
  id: string;
  title: string;
  description: string;
  stack: string[];
  completionPercent: number;
  links: {
    github?: string;
    live?: string;
  };
  accentColor: string;
  orbitIndex: number;
  planetSize?: number;
  planetImage?: number;
}

interface PlanetProps {
  project: PlanetProject;
  planetRadius: number;
  imageSrc: string;
}

const ProjectDetails = ({ project }: { project: PlanetProject }) => (
  <div className="flex flex-col h-full">
    <h3 className="text-xl font-bold mb-2 text-cyan-300">{project.title}</h3>
    <p className="text-sm text-gray-300 mb-4 flex-grow overflow-y-auto custom-scrollbar">
      {project.description}
    </p>

    <div className="mb-4">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tech Stack</h4>
      <div className="flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span key={tech} className="px-2 py-1 text-xs rounded-full bg-white/10 text-cyan-200 border border-white/20">
            {tech}
          </span>
        ))}
      </div>
    </div>

    <div className="flex gap-3 mt-auto">
      {project.links.github && (
        <a
          href={project.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 text-center text-sm font-medium bg-white/10 hover:bg-white/20 rounded-md transition-colors border border-white/20 text-white"
        >
          GitHub
        </a>
      )}
      {project.links.live && (
        <a
          href={project.links.live}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 text-center text-sm font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-md transition-colors border border-cyan-500/50"
        >
          Live Demo
        </a>
      )}
    </div>
  </div>
);

const Planet = ({ project, planetRadius, imageSrc }: PlanetProps) => {
  const { isDarkMode } = useTheme();

  // Determine filter based on theme
  const filterStyle = isDarkMode
    ? 'brightness(0.8) contrast(1.1)'
    : 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))';

  return (
    <div
      className="planet-wrapper relative flex justify-center items-center w-full h-full pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-110"
      style={{
        width: planetRadius * 2,
        height: planetRadius * 2,
      }}
    >
      {/* Planet Image */}
      <div
        className="planet-sprite absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${imageSrc}')`,
          filter: filterStyle
        }}
      />

      {/* Title below planet */}
      <div
        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none"
      >
        <p className={`text-sm font-medium ${isDarkMode ? 'text-black' : 'text-white'} drop-shadow-md`}>
          {project.title}
        </p>
      </div>
    </div>
  );
};

export default Planet;
