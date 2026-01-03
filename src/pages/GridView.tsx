import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicNavbar } from "@/components/DynamicNavbar";
import Stars from "@/components/Stars";
import { useTheme } from "@/contexts/ThemeContext";
import { projects } from "@/data/projects";
import { DiagonalProjectCard } from "@/components/DiagonalProjectCard";

const GridView = () => {
  const { isDarkMode } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{
        backgroundColor: isDarkMode ? '#ffffff' : '#000000', // White in Dark Mode as requested
        transition: 'background-color 0.5s ease'
      }}
    >
      {/* Starfield Background - Hide in Dark Mode if we want pure white, or keep it? 
          Stars are usually white/light, so they won't show on white BG. 
          The user asked for "background to be white", likely implying a clean look.
          We can hide stars or invert them. Let's hide them for now to ensure "White".
       */}
      <div className={`fixed inset-0 z-0 ${isDarkMode ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <Stars />
      </div>

      {/* Dynamic Navbar with Projects Mode */}
      <DynamicNavbar viewMode="projects" />

      {/* Title overlay when no project is expanded */}
      <AnimatePresence>
        {expandedIndex === null && (
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 pointer-events-none text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className={`text-4xl md:text-6xl font-black tracking-tight select-none ${isDarkMode ? 'text-black/5' : 'text-white/10'}`}>
              PROJECTS
            </h1>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-black/20' : 'text-white/20'}`}>
              Click a card to explore
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagonal Accordion Project Cards */}
      {projects.map((project, index) => (
        <DiagonalProjectCard
          key={project.id}
          project={project}
          index={index}
          totalProjects={projects.length}
          expandedIndex={expandedIndex}
          onExpand={setExpandedIndex}
        />
      ))}
    </div>
  );
};

export default GridView;
