import { Github, Linkedin, Mail } from "lucide-react";

const Hero = () => {
  return (
    <header className="absolute inset-0 flex items-center justify-start px-8 md:px-16 overflow-hidden z-20 pointer-events-none">
      {/* Half Sun - Left Edge with Info Inside */}
      <div className="absolute -left-[250px] md:-left-[350px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none z-0">
        <div
          className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{
            background: "var(--gradient-sun)",
          }}
        />
        {/* Inner glow layers */}
        <div
          className="absolute inset-0 rounded-full opacity-80"
          style={{
            background: "radial-gradient(circle at 60% 50%, hsl(var(--sun-glow)), transparent 60%)",
          }}
        />
        
        {/* Info inside the sun - positioned on the visible right half */}
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2 text-center space-y-3 pointer-events-auto z-10 max-w-[200px]">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Your Name
          </h1>
          <p className="text-sm md:text-base text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Full-Stack Developer
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white transition-colors drop-shadow-lg"
              aria-label="GitHub Profile"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white transition-colors drop-shadow-lg"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:your.email@example.com"
              className="text-white/90 hover:text-white transition-colors drop-shadow-lg"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
