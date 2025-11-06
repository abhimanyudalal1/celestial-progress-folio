import { Github, Linkedin, Mail } from "lucide-react";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";

const Hero = () => {
  return (
    <header 
      className="absolute inset-0 flex items-start justify-start overflow-hidden z-20 pointer-events-none"
      style={{ 
        padding: 'clamp(1rem, 3vw, 2rem) clamp(1rem, 2.5vw, 4rem)',
        paddingTop: 'clamp(1rem, 2.5vw, 1.5rem)'
      }}
    >
      {/* Animated text in top left - responsive scaling */}
      <div className="pointer-events-none">
        <div 
          className="flex items-center text-white font-bold"
          style={{ 
            fontSize: 'clamp(1.25rem, 3.5vw, 2.25rem)',
            gap: 'clamp(0.5rem, 1vw, 0.75rem)'
          }}
        >
          <span>Explore</span>
          <AnimatedTextCycle 
            words={["Projects", "Blogs"]}
            interval={3000}
            className="text-blue-300"
          />
        </div>
      </div>
      
      {/* Hero content is now integrated into the SVG solar system for consistent scaling */}
    </header>
  );
};

export default Hero;
