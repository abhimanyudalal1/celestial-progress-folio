import Hero from "@/components/Hero";
import SolarSystem from "@/components/SolarSystem";
import Stars from "@/components/Stars";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Starfield background */}
      <Stars />
      
      {/* Combined Hero and Solar System in the same view */}
      <div className="relative min-h-screen">
        <Hero />
        <SolarSystem />
      </div>
    </div>
  );
};

export default Index;
