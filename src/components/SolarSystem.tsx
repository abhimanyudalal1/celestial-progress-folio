import { PlanetProject } from "./Planet";
import Planet from "./Planet";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import MeteorCursor from "./MeteorCursor";
import ProjectOverlay from "./ProjectOverlay";

interface SolarSystemProps {
  selectedProject: PlanetProject | null;
  setSelectedProject: (project: PlanetProject | null) => void;
}
{/* <iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/6pWgRkpqVfxnj3WuIcJ7WP?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe> */ }
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
    planetSize: 0.04, // Small planet (Mercury-like)
    planetImage: 1, // Using planet1.svg
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
    planetSize: 0.045, // Small-medium planet (Venus-like)
    planetImage: 2, // Using planet2.svg
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
    planetSize: 0.04, // Medium planet (Earth-like)
    planetImage: 3, // Using planet3.svg
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
    accentColor: "15 65% 55%",
    orbitIndex: 4,
    planetSize: 0.055, // Small-medium planet (Mars-like)
    planetImage: 1, // Using planet1.svg (reusing)
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
    planetSize: 0.06, // Large planet (Jupiter-like)
    planetImage: 2, // Using planet2.svg (reusing)
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
  const { isDarkMode } = useTheme();
  const [overlayState, setOverlayState] = useState<{ project: PlanetProject; initialRect: DOMRect } | null>(null);

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
              {/* Bright yellowish sun gradient for light mode */}
              <radialGradient id="brightSunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(55 100% 75%)" stopOpacity="1" />
                <stop offset="40%" stopColor="hsl(50 100% 65%)" stopOpacity="0.9" />
                <stop offset="80%" stopColor="hsl(45 100% 55%)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="hsl(35 100% 45%)" stopOpacity="0.8" />
              </radialGradient>

              {/* Dark sun gradient for dark mode */}
              <radialGradient id="brightSunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(55 100% 75%)" stopOpacity="1" />
                <stop offset="40%" stopColor="hsl(50 100% 65%)" stopOpacity="0.9" />
                <stop offset="80%" stopColor="hsl(45 100% 55%)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="hsl(35 100% 45%)" stopOpacity="0.8" />
              </radialGradient>
              <radialGradient id="darkSunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(0 0% 15%)" stopOpacity="1" />
                <stop offset="40%" stopColor="hsl(0 0% 10%)" stopOpacity="1" />
                <stop offset="80%" stopColor="hsl(0 0% 5%)" stopOpacity="1.85" />
                <stop offset="100%" stopColor="hsl(0 0% 0%)" stopOpacity="1.8" />
              </radialGradient>
            </defs>

            {/* Clean, bright sun */}
            <g>
              {/* Main sun circle - PNG Base Layer */}
              <image
                href="/starhd.png"
                x={sunCenterX - baseDimension * 0.9}
                y={sunCenterY - baseDimension * 0.9}
                width={baseDimension * 1.8}
                height={baseDimension * 1.8}
                preserveAspectRatio="xMidYMid slice"
                style={{
                  filter: isDarkMode
                    ? 'brightness(0.9) contrast(1.1)'
                    : 'drop-shadow(0 0 50px rgba(255, 200, 50, 0.6))',
                  transition: 'filter 0.5s ease'
                }}
              />

              {/* Sun GIF Overlay */}
              <image
                href="/stargif.gif"
                x={sunCenterX - baseDimension * 0.9}
                y={sunCenterY - baseDimension * 0.9}
                width={baseDimension * 1.8}
                height={baseDimension * 1.8}
                preserveAspectRatio="xMidYMid slice"
                style={{
                  filter: isDarkMode
                    ? 'brightness(0.9) contrast(1.1)'
                    : 'drop-shadow(0 0 50px rgba(255, 200, 50, 0.6))',
                  transition: 'filter 0.5s ease',
                  mixBlendMode: 'screen' // Blend the GIF over the PNG
                }}
              />

              {/* Hero text content - NO transformations */}
              <g>
                {/* Name - DOUBLED font size */}
                <text
                  x={sunCenterX + baseDimension * 0.19}
                  y={sunCenterY - baseDimension * 0.03}
                  textAnchor="middle"
                  fill={isDarkMode ? "#ffffff" : "white"}
                  fontSize={baseDimension * 0.095} // DOUBLED from 0.025 to 0.05
                  fontWeight="bold"
                  className="drop-shadow-lg"
                  style={{
                    transition: 'fill 0.5s ease'
                  }}
                >
                  Abhimanyu
                </text>

                {/* Title - DOUBLED font size */}
                <text
                  x={sunCenterX + baseDimension * 0.19}
                  y={sunCenterY + baseDimension * 0.02}
                  textAnchor="middle"
                  fill={isDarkMode ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.95)"}
                  fontSize={baseDimension * 0.038} // DOUBLED from 0.012 to 0.024
                  className="drop-shadow-md"
                  style={{
                    transition: 'fill 0.5s ease'
                  }}
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
                    fill={isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.15)"}
                    stroke={isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.4)"}
                    strokeWidth="1"
                    style={{ cursor: 'pointer', transition: 'fill 0.5s ease, stroke 0.5s ease' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('https://github.com/abhimanyudalal1', '_blank')}
                  />
                  <text
                    x={sunCenterX + baseDimension * 0.06}
                    y={sunCenterY + baseDimension * 0.088}
                    textAnchor="middle"
                    fill={isDarkMode ? "white" : "white"}
                    fontSize={baseDimension * 0.03} // DOUBLED from 0.01 to 0.02
                    style={{ cursor: 'pointer', pointerEvents: 'none', transition: 'fill 0.5s ease' }}
                  >
                    GH
                  </text>

                  {/* LinkedIn */}
                  <circle
                    cx={sunCenterX + baseDimension * 0.16}
                    cy={sunCenterY + baseDimension * 0.08}
                    r={baseDimension * 0.044}
                    fill={isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.15)"}
                    stroke={isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.4)"}
                    strokeWidth="1"
                    style={{ cursor: 'pointer', transition: 'fill 0.5s ease, stroke 0.5s ease' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('https://linkedin.com/in/abhimanyudalal1', '_blank')}
                  />
                  <text
                    x={sunCenterX + baseDimension * 0.16}
                    y={sunCenterY + baseDimension * 0.088}
                    textAnchor="middle"
                    fill={isDarkMode ? "white" : "white"}
                    fontSize={baseDimension * 0.02}
                    style={{ cursor: 'pointer', pointerEvents: 'none', transition: 'fill 0.5s ease' }}
                  >
                    LI
                  </text>

                  {/* Email */}
                  <circle
                    cx={sunCenterX + baseDimension * 0.26}
                    cy={sunCenterY + baseDimension * 0.08}
                    r={baseDimension * 0.044}
                    fill={isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.15)"}
                    stroke={isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.4)"}
                    strokeWidth="1"
                    style={{ cursor: 'pointer', transition: 'fill 0.5s ease, stroke 0.5s ease' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('mailto:your.email@example.com', '_blank')}
                  />
                  <text
                    x={sunCenterX + baseDimension * 0.26}
                    y={sunCenterY + baseDimension * 0.088}
                    textAnchor="middle"
                    fill={isDarkMode ? "white" : "white"}
                    fontSize={baseDimension * 0.020} // Slightly smaller for @ but still doubled
                    style={{ cursor: 'pointer', pointerEvents: 'none', transition: 'fill 0.5s ease' }}
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

              {/* Draw full elliptical orbits - orbits go around the back of the sun */}
              {projects.map((project) => {
                const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
                const ellipseRx = radius;
                const ellipseRy = radius * 0.65;

                return (
                  <ellipse
                    key={`orbit-${project.id}`}
                    cx={sunCenterX}
                    cy={sunCenterY}
                    rx={ellipseRx}
                    ry={ellipseRy}
                    fill="none"
                    stroke={isDarkMode ? "rgba(0, 0, 0, 0.5)" : "url(#orbitGradient)"}
                    strokeWidth={baseDimension * 0.003}
                    strokeDasharray="18 28"
                    opacity="0.7"
                    style={{
                      filter: isDarkMode ? 'none' : 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
                      transition: 'stroke 0.5s ease, filter 0.5s ease'
                    }}
                  />
                );
              })}
            </svg>

            {/* HTML Planets Layer - Positioned to match SVG coordinates */}
            <div className="absolute inset-0 pointer-events-none">
              {projects.map((project) => {
                const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;

                // Calculate angle
                const baseAngle = 300;
                const angleStep = 21;
                let angle;
                if (project.orbitIndex === 1) {
                  angle = 298;
                } else {
                  angle = (baseAngle + (project.orbitIndex - 1) * angleStep) % 360;
                }

                // Calculate SVG position
                const ellipseRx = radius;
                const ellipseRy = radius * 0.65;
                const svgPos = getPlanetPosition(ellipseRx, ellipseRy, sunCenterX, sunCenterY, angle);
                const planetRadius = baseDimension * (project.planetSize || 0.07);

                // Convert SVG coordinates to Screen/Container coordinates
                // Logic matches preserveAspectRatio="xMinYMid meet" for viewBox="-800 0 3000 1000"
                const viewBoxAspect = viewBoxWidth / viewBoxHeight; // 3
                const containerAspect = dimensions.width / dimensions.height;

                let scale, offsetX, offsetY;

                if (containerAspect < viewBoxAspect) {
                  // Constrained by width
                  scale = dimensions.width / viewBoxWidth;
                  offsetX = 0; // xMin
                  offsetY = (dimensions.height - (viewBoxHeight * scale)) / 2; // YMid
                } else {
                  // Constrained by height
                  scale = dimensions.height / viewBoxHeight;
                  offsetX = 0; // xMin (still 0 because we align left)
                  // Actually xMin means the left edge of viewBox aligns with left edge of viewport.
                  // If constrained by height, the viewport is wider than the scaled viewBox.
                  // So the content will be on the left, and there will be empty space on the right.
                  offsetY = (dimensions.height - (viewBoxHeight * scale)) / 2; // YMid
                }

                // Map SVG coordinate to Screen coordinate
                // SVG x is relative to viewBoxLeft (-800)
                const screenX = (svgPos.x - viewBoxLeft) * scale + offsetX;
                const screenY = (svgPos.y - 0) * scale + offsetY;

                let imageSrc = "";
                switch (project.id) {
                  case "1": imageSrc = "/Terran%20Dry%20-%202161106751.gif"; break;
                  case "2": imageSrc = "/Gas%20giant%201%20-%202161106751.gif"; break;
                  case "3": imageSrc = "/Terran%20Wet%20-%203370142330.gif"; break;
                  case "4": imageSrc = "/Gas%20giant%202%20-%202161106751.gif"; break;
                  case "5": imageSrc = "/Ice%20World%20-%2073626106.gif"; break;
                  default: imageSrc = "";
                }

                return (
                  <div
                    key={`planet-${project.id}`}
                    className="absolute pointer-events-auto"
                    style={{
                      left: screenX,
                      top: screenY,
                      transform: 'translate(-50%, -50%)', // Center the div on the coordinate
                      width: planetRadius * 2,
                      height: planetRadius * 2,
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setOverlayState({ project, initialRect: rect });
                    }}
                  >
                    <Planet
                      project={project}
                      planetRadius={planetRadius}
                      imageSrc={imageSrc}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Project Overlay */}
      {overlayState && (
        <ProjectOverlay
          project={overlayState.project}
          initialRect={overlayState.initialRect}
          onClose={() => setOverlayState(null)}
        />
      )}

      {/* Meteor Cursor */}
      <MeteorCursor />
    </section>
  );
};

export default SolarSystem;
