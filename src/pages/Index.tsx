import Hero from "@/components/Hero";
import SolarSystem from "@/components/SolarSystem";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Combined Hero and Solar System in the same view */}
      <div className="relative min-h-screen">
        <Hero />
        <SolarSystem />
      </div>
      
      <footer className="relative py-8 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          © 2025 Your Name. Built with pure CSS animations and React.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Scroll through the cosmos and explore my work
        </p>
      </footer>
    </div>
  );
};

export default Index;
