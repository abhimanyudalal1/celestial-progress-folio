import { Link } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";
import SkyToggle from "@/components/ui/sky-toggle";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";


const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between" style={{ padding: '0.5rem clamp(0.75rem, 2vw, 1.5rem)' }}>
      {/* Left side - Explore text */}
      <div style={{ width: 'clamp(150px, 15vw, 250px)' }}>
        <div 
          className="flex items-center text-white font-bold"
          style={{ 
            fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
            gap: 'clamp(0.5rem, 1.2vw, 0.75rem)'
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
      
      {/* Center - Navigation buttons */}
      <div className="flex justify-center items-center" style={{ gap: 'clamp(0.5rem, 1.5vw, 1rem)' }}>
        <GradientButton 
          variant="default" 
          className="text-center"
          style={{
            minWidth: 'clamp(80px, 20vw, 2600px)',
            padding: 'clamp(0.5rem, 1.5vw, 1rem) clamp(1rem, 3vw, 2rem)',
            fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
            fontWeight: '500'
          }}
          asChild
        >
          <Link to="/">
            HOME
          </Link>
        </GradientButton>
        
        <GradientButton 
          variant="default" 
          className="text-center"
          style={{
            minWidth: 'clamp(80px, 12vw, 160px)',
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
            minWidth: 'clamp(80px, 12vw, 160px)',
            padding: 'clamp(0.5rem, 1.5vw, 1rem) clamp(1rem, 3vw, 2rem)',
            fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
            fontWeight: '500'
          }}
          asChild
        >
          <Link to="/grid-view">
            PROJECTS
          </Link>
        </GradientButton>
        
        <GradientButton 
          variant="default" 
          className="text-center"
          style={{
            minWidth: 'clamp(80px, 12vw, 160px)',
            padding: 'clamp(0.5rem, 1.5vw, 1rem) clamp(1rem, 3vw, 2rem)',
            fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
            fontWeight: '500'
          }}
          asChild
        >
          <Link to="/about">
            ABOUT
          </Link>
        </GradientButton>
      </div>
      
      {/* Right side - Sky Toggle */}
      <div className="flex justify-end" style={{ width: 'clamp(100px, 10vw, 150px)' }}>
        <SkyToggle />
      </div>
    </nav>
  );
};

export default Navbar;
