import { Github, Linkedin, Mail } from "lucide-react";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";

const Hero = () => {
  return (
    <header className="absolute inset-0 flex items-start justify-start px-8 md:px-16 pt-6 overflow-hidden z-20 pointer-events-none">
      {/* Animated text in top left */}
      <div className="pointer-events-none">
        <div className="flex items-center gap-2 text-white text-3xl md:text-4xl">
          <span className="font-bold">Explore</span>
          <AnimatedTextCycle 
            words={["Projects", "Blogs"]}
            interval={3000}
            className="text-3xl md:text-4xl text-blue-300"
          />
        </div>
      </div>
      
      {/* Hero content is now integrated into the SVG solar system for consistent scaling */}
    </header>
  );
};

export default Hero;
