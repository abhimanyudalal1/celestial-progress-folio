import { PlanetProject } from "./Planet";
import Planet from "./Planet";
import { useState, useEffect } from "react";

interface SolarSystemProps {
  selectedProject: PlanetProject | null;
  setSelectedProject: (project: PlanetProject | null) => void;
}

// Sample projects data
const projects: PlanetProject[] = [
  {
    id: "1",
    title: "Human-AI interaction",
    description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include real-time inventory management, user authentication, and a responsive checkout flow.",
    stack: ["React", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
    completionPercent: 75,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "200 65% 55%",
    orbitIndex: 1,
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A collaborative project management tool with drag-and-drop functionality, real-time updates via WebSockets, and team collaboration features.",
    stack: ["TypeScript", "Next.js", "Prisma", "Socket.io", "shadcn/ui"],
    completionPercent: 32,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "280 70% 60%",
    orbitIndex: 2,
  },
  {
    id: "3",
    title: "AI Content Generator",
    description: "An AI-powered content creation tool leveraging GPT-4 for blog posts, social media, and marketing copy. Includes templates and tone customization.",
    stack: ["React", "OpenAI API", "Firebase", "Framer Motion"],
    completionPercent: 68,
    links: {
      github: "https://github.com",
    },
    accentColor: "140 70% 50%",
    orbitIndex: 3,
  },
  {
    id: "4",
    title: "Weather Dashboard",
    description: "A beautiful weather forecasting dashboard with interactive maps, hourly predictions, and location-based alerts. Built with modern design patterns.",
    stack: ["Vue.js", "D3.js", "OpenWeather API", "CSS Grid"],
    completionPercent: 50,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "15 85% 55%",
    orbitIndex: 4,
  },
  {
    id: "5",
    title: "Portfolio Analytics",
    description: "Real-time analytics dashboard for tracking portfolio performance, visitor insights, and engagement metrics with beautiful data visualizations.",
    stack: ["React", "Chart.js", "Express", "MongoDB", "AWS"],
    completionPercent: 75,
    links: {
      github: "https://github.com",
    },
    accentColor: "260 75% 65%",
    orbitIndex: 5,
  },
];

/**
 * Calculate planet position on an elliptical orbit
 * @param radiusX - Horizontal radius of the ellipse
 * @param radiusY - Vertical radius of the ellipse (compressed for 3D effect)
 * @param sunCenterX - X coordinate of sun center
 * @param sunCenterY - Y coordinate of sun center
 * @param angleDeg - Angle in degrees for position on ellipse
 */
const getPlanetPosition = (
  radiusX: number,
  radiusY: number,
  sunCenterX: number,
  sunCenterY: number,
  angleDeg: number
): { x: number; y: number } => {
  const angleRad = (angleDeg * Math.PI) / 180;
  const x = sunCenterX + radiusX * Math.cos(angleRad);
  const y = sunCenterY + radiusY * Math.sin(angleRad);
  return { x, y };
};

const SolarSystem = ({ selectedProject, setSelectedProject }: SolarSystemProps) => {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };

    updateDimensions(); // Initial call
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Base dimension for responsive scaling
  const baseDimension = Math.min(dimensions.width, dimensions.height);

  // SVG viewBox dimensions - expanded to show large orbits
  const viewBoxWidth = 3000; // Much wider to accommodate large orbits
  const viewBoxHeight = 1000; // Fixed height that works  
  const viewBoxLeft = -800; // Further left to show full orbits

  // Sun center position - positioned on the left side like the reference image
  const sunCenterX = -700; // Move sun much further to the left
  const sunCenterY = 500; // Center vertically

  // Orbit radii - make them smaller to bring planets closer to the sun
  const baseRadius = baseDimension * 0.4; // Reduced from 1.2 to 0.4 (much smaller orbits)
  const orbitRadii = {
    r1: baseRadius * 2.0, // Smaller, tighter orbits
    r2: baseRadius * 3.0,
    r3: baseRadius * 4.0, 
    r4: baseRadius * 5.0,
    r5: baseRadius * 6.0,
  };

  return (
    <section className="absolute inset-0 flex items-center justify-start pointer-events-none z-10" aria-label="Projects Solar System">
      <div className="relative w-full h-full">
        {/* Clean Sun Element - NO 3D transformations */}
        <div className="absolute inset-0">
          <svg
            className="w-full h-full"
            viewBox={`${viewBoxLeft} 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMinYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
            }}
          >
            <defs>
              {/* Bright yellowish sun gradient */}
              <radialGradient id="brightSunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(55 100% 75%)" stopOpacity="1" />
                <stop offset="40%" stopColor="hsl(50 100% 65%)" stopOpacity="0.9" />
                <stop offset="80%" stopColor="hsl(45 100% 55%)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="hsl(35 100% 45%)" stopOpacity="0.8" />
              </radialGradient>
            </defs>

            {/* Clean, bright sun */}
            <g>
              {/* Main sun circle - DOUBLED in size */}
              <circle
                cx={sunCenterX}
                cy={sunCenterY}
                r={baseDimension * 0.5} // DOUBLED from 0.25 to 0.5
                fill="url(#brightSunGradient)"
                stroke="hsl(45 100% 80%)"
                strokeWidth={baseDimension * 0.016} // Doubled stroke width too
                style={{
                  filter: `drop-shadow(0 0 ${baseDimension * 0.12}px hsl(45 100% 60% / 0.8))`,
                }}
              />

              {/* Hero text content - NO transformations */}
              <g>
                {/* Name - DOUBLED font size */}
                <text
                  x={sunCenterX + baseDimension * 0.19} 
                  y={sunCenterY - baseDimension * 0.03}
                  textAnchor="middle"
                  fill="white"
                  fontSize={baseDimension * 0.095} // DOUBLED from 0.025 to 0.05
                  fontWeight="bold"
                  className="drop-shadow-lg"
                >
                  Abhimanyu
                </text>
                
                {/* Title - DOUBLED font size */}
                <text
                  x={sunCenterX + baseDimension * 0.19}
                  y={sunCenterY + baseDimension * 0.02}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.95)"
                  fontSize={baseDimension * 0.038} // DOUBLED from 0.012 to 0.024
                  className="drop-shadow-md"
                >
                Machine Learning/GenAI Engineer
                </text>

                {/* Social icons - DOUBLED sizing and positioning */}
                <g>
                  {/* GitHub */}
                  <circle
                    cx={sunCenterX + baseDimension * 0.06} 
                    cy={sunCenterY + baseDimension * 0.08}
                    r={baseDimension * 0.044} // DOUBLED from 0.012 to 0.024
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('https://github.com/abhimanyudalal1', '_blank')}
                  />
                  <text
                    x={sunCenterX + baseDimension * 0.06}
                    y={sunCenterY + baseDimension * 0.088}
                    textAnchor="middle"
                    fill="white"
                    fontSize={baseDimension * 0.03} // DOUBLED from 0.01 to 0.02
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    GH
                  </text>

                  {/* LinkedIn */}
                  <circle
                    cx={sunCenterX + baseDimension * 0.16}
                    cy={sunCenterY + baseDimension * 0.08}
                    r={baseDimension * 0.044}
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('https://linkedin.com/in/abhimanyudalal1', '_blank')}
                  />
                  <text
                    x={sunCenterX + baseDimension * 0.16}
                    y={sunCenterY + baseDimension * 0.088}
                    textAnchor="middle"
                    fill="white"
                    fontSize={baseDimension * 0.02}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    LI
                  </text>

                  {/* Email */}
                  <circle
                    cx={sunCenterX + baseDimension * 0.26}
                    cy={sunCenterY + baseDimension * 0.08}
                    r={baseDimension * 0.044}
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('mailto:your.email@example.com', '_blank')}
                  />
                  <text
                    x={sunCenterX + baseDimension * 0.26}
                    y={sunCenterY + baseDimension * 0.088}
                    textAnchor="middle"
                    fill="white"
                    fontSize={baseDimension * 0.020} // Slightly smaller for @ but still doubled
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    @
                  </text>
                </g>
              </g>
            </g>
          </svg>
        </div>

        {/* 3D Stage Container with Perspective - ONLY for orbits and planets */}
        <div 
          className="absolute inset-0"
          style={{
            perspective: '2000px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          <div 
            className="w-full h-full solar-system-stage"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateX(25deg) rotateY(-8deg)',
              transformOrigin: 'center center',
              transition: 'transform 0.6s ease-out',
            }}
          >
            <svg
              className="w-full h-full"
              viewBox={`${viewBoxLeft} 0 ${viewBoxWidth} ${viewBoxHeight}`}
              preserveAspectRatio="xMinYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                pointerEvents: 'none',
              }}
            >
          {/* Define patterns for dashed strokes - only for orbits */}
          <defs>
            <pattern id="dashPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="20" y2="0" stroke="white" strokeWidth="2" strokeDasharray="8 12" />
            </pattern>
            {/* Linear gradient for orbit depth effect */}
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Draw full elliptical orbits and planets - orbits go around the back of the sun */}
          {projects.map((project, index) => {
            const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
            // Distribute planets more evenly around the orbits
            // Spread them out more to match the reference image
            const baseAngle = 300; // Start from upper area
            const angleStep = 21; // More degrees between each planet for better spacing
            // Special positioning for the first planet (blue)
            let angle;
            if (project.orbitIndex === 1) {
              angle = 298; // Move the first planet to a different position
            
            } else {
              angle = (baseAngle + (project.orbitIndex - 1) * angleStep) % 360;
            }
            
            // Create full elliptical orbit that goes around the back of the sun
            // Use ellipse instead of arc for full 3D effect
            const ellipseRx = radius; // Horizontal radius
            const ellipseRy = radius * 0.65; // Vertical radius (compressed for 3D perspective)
            
            // Calculate planet position on this elliptical orbit
            const position = getPlanetPosition(ellipseRx, ellipseRy, sunCenterX, sunCenterY, angle);
            const planetRadius = baseDimension * 0.07; // DOUBLED from 0.035 to 0.07
            
            return (
              <g key={`orbit-planet-${project.id}`}>
                {/* Full elliptical orbit path - responsive stroke but thicker */}
                <ellipse
                  cx={sunCenterX}
                  cy={sunCenterY}
                  rx={ellipseRx}
                  ry={ellipseRy}
                  fill="none"
                  stroke="url(#orbitGradient)"
                  strokeWidth={baseDimension * 0.003} // Increased from 0.001 to 0.003
                  strokeDasharray="18 28"
                  opacity="0.7"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
                  }}
                />
                
                {/* Planet positioned on this orbit */}
                <g
                  className="pointer-events-auto planet-group"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedProject(project)}
                  transform={`translate(${position.x}, ${position.y})`}
                >
                  <g 
                    className="planet-inner" 
                    transform="scale(1)" 
                    style={{ 
                      transformOrigin: 'center center',
                    }}
                  >
                    {/* Planet circle - responsive sizing */}
                    <circle
                      cx="0"
                      cy="0"
                      r={planetRadius}
                      fill={`hsl(${project.accentColor})`}
                      stroke={`hsl(${project.accentColor})`}
                      strokeWidth={baseDimension * 0.001} // 0.1% of smaller viewport
                      opacity="0.9"
                      style={{
                        filter: `drop-shadow(0 0 ${baseDimension * 0.005}px hsl(${project.accentColor} / 0.6))`,
                      }}
                    />
                    {/* Planet inner glow */}
                    <circle
                      cx="0"
                      cy="0"
                      r={planetRadius * 0.3}
                      fill={`hsl(${project.accentColor} / 0.5)`}
                    />
                  </g>
                  {/* Project title text - responsive font size and positioning */}
                  <text
                    x="0"
                    y={planetRadius + baseDimension * 0.05}
                    textAnchor="middle"
                    fill="white"
                    fontSize={baseDimension * 0.030} // 0.6% of smaller viewport
                    fontWeight="500"
                    className="drop-shadow-lg pointer-events-none"
                  >
                    {project.title}
                  </text>
                </g>
              </g>
            );
          })}

        </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolarSystem;
