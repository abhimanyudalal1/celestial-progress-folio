import { Link } from "react-router-dom";
import { useState } from "react";
import Hero from "@/components/Hero";
import SolarSystem from "@/components/SolarSystem";
import Stars from "@/components/Stars";
import ProjectPanel from "@/components/ProjectPanel";
import { GradientButton } from "@/components/ui/gradient-button";
import { PlanetProject } from "@/components/Planet";
import { useScrollTrigger } from "@/hooks/use-scroll-trigger";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);
  
  // Initialize GSAP ScrollTrigger animations
  useScrollTrigger();

  return (
    <div className="scroll-track">
      {/* Starfield background */}
      <Stars />
      
      {/* Top Navigation - responsive scaling */}
      <nav className="fixed top-0 left-0 right-0 z-40" style={{ padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
        <div className="flex justify-center" style={{ gap: 'clamp(0.5rem, 1.5vw, 1rem)' }}>
          <GradientButton 
            variant="variant" 
            className="text-center"
            style={{
              minWidth: 'clamp(100px, 15vw, 200px)',
              padding: 'clamp(0.5rem, 1.5vw, 1rem) clamp(1rem, 3vw, 2rem)',
              fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
              fontWeight: '500'
            }}
            asChild
          >
            <Link to="/blogs">
              BLOGS
            </Link>
          </GradientButton>
          <GradientButton 
            variant="default" 
            className="text-center"
            style={{
              minWidth: 'clamp(100px, 15vw, 200px)',
              padding: 'clamp(0.5rem, 1.5vw, 1rem) clamp(1rem, 3vw, 2rem)',
              fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
              fontWeight: '500'
            }}
            asChild
          >
            <Link to="/grid-view">
              GRID VIEW
            </Link>
          </GradientButton>
        </div>
      </nav>
      
      {/* Hero Pin Section - Solar System that will be pinned during scroll */}
      <section className="hero-pin relative min-h-screen">
        <Hero />
        <SolarSystem 
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      </section>

      {/* Project List Section - No longer needed, integrated into SolarSystem */}
      {/* <section className="project-list min-h-screen relative" style={{ opacity: 0 }}>
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-12">All Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          </div>
        </div>
      </section> */}

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
