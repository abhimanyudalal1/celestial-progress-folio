import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Hero from "@/components/Hero";
import SolarSystem from "@/components/SolarSystem";
import Stars from "@/components/Stars";
import ProjectPanel from "@/components/ProjectPanel";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import { PlanetProject } from "@/components/Planet";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);
  const { isDarkMode } = useTheme();
  
  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: isDarkMode ? '#ffffff' : 'transparent',
      transition: 'background-color 1.7s ease-in-out'
    }}>
      {/* Starfield background */}
      <Stars />
      
      {/* Navigation Bar */}
      <MiniNavbar />
      
      {/* Combined Hero and Solar System in the same view */}
      <div className="relative min-h-screen">
        <Hero />
        <SolarSystem 
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
        
        {/* Subtle Hint Text - pointing to planets */}
        {!selectedProject && (
          <div 
            className="absolute z-20 pointer-events-none"
            style={{
              top: '30%',
              right: '25%',
              transform: 'translateY(-50%)',
            }}
          >
            <div className="relative animate-pulse">
              {/* Arrow pointing left towards planets */}
              <svg 
                width="80" 
                height="40" 
                viewBox="0 0 80 40" 
                className="absolute -left-20 top-1/2 -translate-y-1/2"
                style={{
                  opacity: isDarkMode ? 0.3 : 0.5,
                  filter: isDarkMode ? 'none' : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
                }}
              >
                <path 
                  d="M 70 20 L 10 20 M 10 20 L 20 15 M 10 20 L 20 25" 
                  stroke={isDarkMode ? "#000000" : "#ffffff"} 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              {/* Hint Text */}
              <p 
                className="text-sm font-medium whitespace-nowrap"
                style={{
                  color: isDarkMode ? '#000000' : '#ffffff',
                  opacity: isDarkMode ? 0.4 : 0.6,
                  textShadow: isDarkMode ? 'none' : '0 0 10px rgba(255, 255, 255, 0.5)',
                  transition: 'color 0.5s ease, opacity 0.5s ease, text-shadow 0.5s ease'
                }}
              >
                Click on a planet to explore projects
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Project Details Panel - rendered at root level */}
      {selectedProject && (
        <ProjectPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Spotify Mini Player - Bottom Left Corner */}
      <div className="fixed bottom-4 left-4 z-30 opacity-15 hover:opacity-80 transition-opacity ">
        <iframe 
          data-testid="embed-iframe" 
          style={{ borderRadius: '1px' }} 
          src="https://open.spotify.com/embed/track/6pWgRkpqVfxnj3WuIcJ7WP?utm_source=generator&theme=0" 
          width="-200" 
          height="80" 
          frameBorder="0" 
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media;" 
          loading="lazy"
          title="Spotify Player"
        />
      </div>
    </div>
  );
};

export default Index;
