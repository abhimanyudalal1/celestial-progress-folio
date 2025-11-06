import { PlanetProject } from "./Planet";

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
    completionPercent: 45,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "200 85% 55%",
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
    completionPercent: 10,
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

  // SVG viewBox dimensions - extend left to show full orbits, shifted for left alignment
  const viewBoxWidth = 10;
  const viewBoxHeight = 700;
  const viewBoxLeft = -140; // Start viewBox further left to accommodate the shifted sun and orbits

  // Sun center position - aligned with Hero component, shifted left
  // Hero component positions sun at -250px (mobile) or -350px (desktop) with width 500px/700px
  // The sun's geometric center should be at the viewport's left edge (x=0 in screen coordinates)
  // For mobile: sun left edge at -250px, width 500px, so center at -250 + 250 = 0px
  // For desktop: sun left edge at -350px, width 700px, so center at -350 + 350 = 0px
  // In SVG coordinates, we need to map this to our viewBox
  // Shifting the entire setup left by moving sun center from 0 to -100
  const sunCenterX = -110; // Sun center shifted left
  const sunCenterY = viewBoxHeight / 2; // Vertically centered at 450

  // Orbit radii for the 5 planets - these should extend from the sun center at x=0
  const orbitRadii = {
    r1: 300,
    r2: 450,
    r3: 600,
    r4: 750,
    r5: 900,
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
              {/* Main sun circle */}
              <circle
                cx={sunCenterX}
                cy={sunCenterY}
                r="180"
                fill="url(#brightSunGradient)"
                stroke="hsl(45 100% 80%)"
                strokeWidth="4"
                style={{
                  filter: 'drop-shadow(0 0 40px hsl(45 100% 60% / 0.8))',
                }}
              />

              {/* Hero text content - NO transformations */}
              <g>
                {/* Name */}
                <text
                  x={sunCenterX + 80}
                  y={sunCenterY - 15}
                  textAnchor="middle"
                  fill="white"
                  fontSize="32"
                  fontWeight="bold"
                  className="drop-shadow-lg"
                >
                  Abhimanyu
                </text>
                
                {/* Title */}
                <text
                  x={sunCenterX + 80}
                  y={sunCenterY + 10}
                  textAnchor="middle"
                  fill="rgba(255, 255, 255, 0.95)"
                  fontSize="13"
                  className="drop-shadow-md"
                >
                Machine Learning/GenAI Engineer
                </text>

                {/* Social icons */}
                <g>
                  {/* GitHub */}
                  <circle
                    cx={sunCenterX + 55}
                    cy={sunCenterY + 40}
                    r="12"
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('https://github.com/abhimanyudalal1', '_blank')}
                  />
                  <text
                    x={sunCenterX + 55}
                    y={sunCenterY + 44}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    GH
                  </text>

                  {/* LinkedIn */}
                  <circle
                    cx={sunCenterX + 80}
                    cy={sunCenterY + 40}
                    r="12"
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('https://linkedin.com/in/abhimanyudalal1', '_blank')}
                  />
                  <text
                    x={sunCenterX + 80}
                    y={sunCenterY + 44}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    LI
                  </text>

                  {/* Email */}
                  <circle
                    cx={sunCenterX + 105}
                    cy={sunCenterY + 40}
                    r="12"
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('mailto:your.email@example.com', '_blank')}
                  />
                  <text
                    x={sunCenterX + 105}
                    y={sunCenterY + 44}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
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
            // Distribute planets based on their orbit index and some variation
            // Keep angles within right semicircle (270° to 90°, going clockwise)
            const baseAngle = 300; // Start from upper-right
            const angleStep = 20; // 20 degrees between each planet
            const angle = (baseAngle + (project.orbitIndex - 1) * angleStep) % 360;
            
            // Create full elliptical orbit that goes around the back of the sun
            // Use ellipse instead of arc for full 3D effect
            const ellipseRx = radius; // Horizontal radius
            const ellipseRy = radius * 0.7; // Vertical radius (compressed for 3D perspective)
            
            // Calculate planet position on this elliptical orbit
            const position = getPlanetPosition(ellipseRx, ellipseRy, sunCenterX, sunCenterY, angle);
            const planetRadius = 20; // Size of planet circle
            
            return (
              <g key={`orbit-planet-${project.id}`}>
                {/* Full elliptical orbit path */}
                <ellipse
                  cx={sunCenterX}
                  cy={sunCenterY}
                  rx={ellipseRx}
                  ry={ellipseRy}
                  fill="none"
                  stroke="url(#orbitGradient)"
                  strokeWidth="2"
                  strokeDasharray="8 12"
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
                    {/* Planet circle */}
                    <circle
                      cx="0"
                      cy="0"
                      r={planetRadius}
                      fill={`hsl(${project.accentColor})`}
                      stroke={`hsl(${project.accentColor})`}
                      strokeWidth="2"
                      opacity="0.9"
                      style={{
                        filter: `drop-shadow(0 0 10px hsl(${project.accentColor} / 0.6))`,
                      }}
                    />
                    {/* Planet inner glow */}
                    <circle
                      cx="0"
                      cy="0"
                      r={planetRadius * 0.7}
                      fill={`hsl(${project.accentColor} / 0.5)`}
                    />
                  </g>
                  {/* Project title text */}
                  <text
                    x="0"
                    y={planetRadius + 35}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
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
