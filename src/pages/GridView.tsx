import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicNavbar } from "@/components/DynamicNavbar";
import Stars from "@/components/Stars";
import { useTheme } from "@/contexts/ThemeContext";
import { projects } from "@/data/projects";
import { DiagonalProjectCard } from "@/components/DiagonalProjectCard";

const GridView = () => {
  const { isDarkMode } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Escape collapses the expanded sector
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedIndex(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{
        backgroundColor: isDarkMode ? '#ffffff' : '#000000',
        transition: 'background-color 0.5s ease'
      }}
    >
      {/* Starfield behind the sectors (space mode only — invisible on mono white) */}
      <div className={`fixed inset-0 z-0 ${isDarkMode ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <Stars />
      </div>

      {/* Dynamic Navbar with Projects Mode */}
      <DynamicNavbar viewMode="projects" />

      {/* Mission index chip — sits above the sectors, matches the tour's mono labels */}
      <AnimatePresence>
        {expandedIndex === null && (
          <motion.div
            className="fixed bottom-8 inset-x-0 z-40 flex justify-center pointer-events-none"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.35em] px-5 py-2.5 rounded-full border border-white/15 bg-black/30 text-white/60 backdrop-blur-md">
              Mission Index · 0{projects.length} Sectors · Select to expand
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagonal Accordion Project Sectors */}
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
