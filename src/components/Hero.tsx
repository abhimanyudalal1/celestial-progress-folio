import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, FileText } from "lucide-react";

const Hero = () => {
  return (
    <header className="relative min-h-screen flex items-center px-8 md:px-16 overflow-hidden">
      {/* Half Sun - Right Edge */}
      <div className="absolute -right-[250px] md:-right-[350px] top-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none">
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
            background: "radial-gradient(circle at 40% 50%, hsl(var(--sun-glow)), transparent 60%)",
          }}
        />
      </div>

      {/* Content - Left aligned */}
      <div className="relative z-10 max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Your Name
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Full-Stack Developer · Creative Technologist
          </p>
        </div>

        <p className="text-lg text-muted-foreground max-w-xl">
          Building stellar digital experiences at the intersection of design and engineering.
          Passionate about creating accessible, performant web applications.
        </p>

        <div className="flex gap-4 pt-4">
          <Button variant="default" size="lg" className="gap-2">
            <FileText className="w-4 h-4" />
            View Resume
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Me
          </Button>
        </div>

        <div className="flex gap-4 pt-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub Profile"
          >
            <Github className="w-6 h-6" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="w-6 h-6" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Hero;
