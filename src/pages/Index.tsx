import { Link } from "react-router-dom";
import { useState } from "react";
import Hero from "@/components/Hero";
import SolarSystem from "@/components/SolarSystem";
import Stars from "@/components/Stars";
import ProjectPanel from "@/components/ProjectPanel";
import { GradientButton } from "@/components/ui/gradient-button";
import { PlanetProject } from "@/components/Planet";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);

  return (
    <div className="min-h-screen">
      {/* Starfield background */}
      <Stars />
      
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-40 p-6">
        <div className="flex justify-center gap-4">
          <GradientButton variant="variant" className="min-w-[200px] px-12" asChild>
            <Link to="/blogs">
              BLOGS
            </Link>
          </GradientButton>
          <GradientButton variant="default" className="min-w-[200px] px-12" asChild>
            <Link to="/grid-view">
              GRID VIEW
            </Link>
          </GradientButton>
        </div>
      </nav>
      
      {/* Combined Hero and Solar System in the same view */}
      <div className="relative min-h-screen">
        <Hero />
        <SolarSystem 
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      </div>

      {/* Project Details Panel - rendered at root level */}
      {selectedProject && (
        <ProjectPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default Index;
