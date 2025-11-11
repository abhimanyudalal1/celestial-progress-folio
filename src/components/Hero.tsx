import { Github, Linkedin, Mail } from "lucide-react";

const Hero = () => {
  return (
    <header 
      className="absolute inset-0 flex items-start justify-start overflow-hidden z-20 pointer-events-none"
      style={{ 
        padding: 'clamp(1rem, 3vw, 2rem) clamp(1rem, 2.5vw, 4rem)',
        paddingTop: 'clamp(1rem, 2.5vw, 1.5rem)'
      }}
    >
      {/* Hero content is now integrated into the SVG solar system for consistent scaling */}
    </header>
  );
};

export default Hero;
