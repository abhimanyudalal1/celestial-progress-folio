import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ShaderDemo = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Animated Shader Background */}
      <AnimatedShaderBackground />
      
      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4">
        {/* Back Button */}
        <Link 
          to="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Portfolio
        </Link>
        
        {/* Title and Description */}
        <div className="text-center max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in">
            Aurora Shader
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8">
            A mesmerizing animated shader background created with Three.js and GLSL
          </p>
          
          {/* Tech Stack */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Three.js', 'WebGL', 'GLSL', 'React', 'TypeScript'].map((tech) => (
              <span 
                key={tech}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShaderDemo;
