import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Stars from "@/components/Stars";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div 
      className="flex flex-col min-h-screen items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: isDarkMode ? '#ffffff' : '#000000',
        transition: 'background-color 0.5s ease'
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Stars />
      </div>
      
      {/* Navbar */}
      <MiniNavbar />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 
          className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter mb-0"
          style={{
            color: isDarkMode ? '#000000' : '#ffffff',
            textShadow: isDarkMode 
              ? 'none' 
              : '0 0 60px rgba(255, 255, 255, 0.3)',
            transition: 'color 0.5s ease'
          }}
        >
          404
        </h1>
        
        <p 
          className="text-xl md:text-2xl font-medium mb-8 -mt-4"
          style={{
            color: isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            transition: 'color 0.5s ease'
          }}
        >
          Lost in space? This page doesn't exist.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: isDarkMode ? '#000000' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
            }}
          >
            <Home size={18} />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium border-2 transition-all duration-300 hover:scale-105"
            style={{
              borderColor: isDarkMode ? '#000000' : '#ffffff',
              color: isDarkMode ? '#000000' : '#ffffff',
              backgroundColor: 'transparent',
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
