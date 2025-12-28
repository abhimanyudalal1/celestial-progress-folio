import { PlanetProject } from "./Planet";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import MeteorCursor from "./MeteorCursor";
import { Github, Linkedin, Mail } from "lucide-react";
import { toLegacyProjects } from "@/data/projects";

interface SolarSystemProps {
  selectedProject: PlanetProject | null;
  setSelectedProject: (project: PlanetProject | null) => void;
}

import { SOLAR_CONFIG, getPlanetPosition, getOrbitRadii, getPlanetAngle } from "@/lib/solar-system-config";

// Get projects from centralized data
const projects: PlanetProject[] = toLegacyProjects();

const SolarSystem = ({ selectedProject, setSelectedProject }: SolarSystemProps) => {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const { isDarkMode } = useTheme();

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

  // SVG viewBox dimensions
  const { viewBoxWidth, viewBoxHeight, viewBoxLeft, sunCenterX, sunCenterY } = SOLAR_CONFIG;

  // Orbit radii
  const orbitRadii = getOrbitRadii(baseDimension);

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
              {/* Clip path for the sun images */}
              <clipPath id="sunClip">
                <circle
                  cx={sunCenterX + baseDimension * 0.16}
                  cy={sunCenterY}
                  r={baseDimension * 0.9} // Adjust radius as needed to cover the sun images
                />
              </clipPath>
            </defs>

            {/* Clean, bright sun */}
            <g>
              {/* Main sun composition - Layered PNG and GIF */}
              <g clipPath="url(#sunClip)">
                {/* Base Texture - Swaps between Star HD and Black Hole GIF */}
                <image
                  href={isDarkMode ? "/stardark.gif" : "/starhd.png"}
                  x={sunCenterX - baseDimension * 0.9}
                  y={sunCenterY - baseDimension * 0.9}
                  width={baseDimension * 1.8}
                  height={baseDimension * 1.8}
                  preserveAspectRatio="xMidYMid slice"
                  style={{
                    filter: isDarkMode
                      ? 'scale(1.2) brightness(1.1) contrast(1.2)' // Slight scale up for black hole
                      : 'drop-shadow(0 0 50px rgba(255, 200, 50, 0.6))',
                    transition: 'filter 0.5s ease'
                  }}
                />

                {/* Animated Overlay - Only for Light Mode (Star) */}
                {!isDarkMode && (
                  <image
                    href="/stargif.gif"
                    x={sunCenterX - baseDimension * 0.9}
                    y={sunCenterY - baseDimension * 0.9}
                    width={baseDimension * 1.8}
                    height={baseDimension * 1.8}
                    preserveAspectRatio="xMidYMid slice"
                    style={{
                      opacity: 0.99, // Blend with the HD texture
                      mixBlendMode: 'screen', // Additive blending for glow effect
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </g>

              {/* Hero text content - NO transformations */}
              <g>
                {/* Name - DOUBLED font size */}
                <text
                  x={sunCenterX + baseDimension * 0.16}
                  y={sunCenterY - baseDimension * 0.03}
                  textAnchor="middle"
                  fill={isDarkMode ? "#ffffff" : "#080102ff"}
                  fontSize={baseDimension * 0.099} // DOUBLED from 0.025 to 0.05
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
                  x={sunCenterX + baseDimension * 0.16}
                  y={sunCenterY + baseDimension * 0.02}
                  textAnchor="middle"
                  fill={isDarkMode ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.95)"}
                  fontSize={baseDimension * 0.038} // DOUBLED from 0.012 to 0.024
                  className="drop-shadow-md"
                  style={{
                    transition: 'fill 0.5s ease'
                  }}
                >
                  Machine Learning Engineer
                </text>

                {/* Social icons - DOUBLED sizing and positioning */}
                <g>
                  {/* GitHub */}
                  <circle
                    cx={sunCenterX + baseDimension * 0.06}
                    cy={sunCenterY + baseDimension * 0.08}
                    r={baseDimension * 0.044} // DOUBLED from 0.012 to 0.024
                    fill={isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(9, 7, 7, 0.15)"}
                    stroke={isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(10, 6, 6, 0.4)"}
                    strokeWidth="1"
                    style={{ cursor: 'pointer', transition: 'fill 0.5s ease, stroke 0.5s ease' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('https://github.com/abhimanyudalal1', '_blank')}
                  />
                  <foreignObject
                    x={sunCenterX + baseDimension * 0.06 - baseDimension * 0.025}
                    y={sunCenterY + baseDimension * 0.08 - baseDimension * 0.025}
                    width={baseDimension * 0.05}
                    height={baseDimension * 0.05}
                    style={{ pointerEvents: 'none' }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Github
                        color={isDarkMode ? "white" : "black"}
                        size="100%"
                        strokeWidth={1.5}
                      />
                    </div>
                  </foreignObject>

                  {/* LinkedIn */}
                  <circle
                    cx={sunCenterX + baseDimension * 0.16}
                    cy={sunCenterY + baseDimension * 0.08}
                    r={baseDimension * 0.044}
                    fill={isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(5, 4, 4, 0.15)"}
                    stroke={isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"}
                    strokeWidth="1"
                    style={{ cursor: 'pointer', transition: 'fill 0.5s ease, stroke 0.5s ease' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('https://linkedin.com/in/abhimanyudalal1', '_blank')}
                  />
                  <foreignObject
                    x={sunCenterX + baseDimension * 0.16 - baseDimension * 0.025}
                    y={sunCenterY + baseDimension * 0.08 - baseDimension * 0.025}
                    width={baseDimension * 0.05}
                    height={baseDimension * 0.05}
                    style={{ pointerEvents: 'none' }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Linkedin
                        color={isDarkMode ? "white" : "black"}
                        size="100%"
                        strokeWidth={1.5}
                      />
                    </div>
                  </foreignObject>

                  {/* Email */}
                  <circle
                    cx={sunCenterX + baseDimension * 0.26}
                    cy={sunCenterY + baseDimension * 0.08}
                    r={baseDimension * 0.044}
                    fill={isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"}
                    stroke={isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(2, 1, 1, 0.4)"}
                    strokeWidth="1"
                    style={{ cursor: 'pointer', transition: 'fill 0.5s ease, stroke 0.5s ease' }}
                    className="pointer-events-auto"
                    onClick={() => window.open('mailto:your.email@example.com', '_blank')}
                  />
                  <foreignObject
                    x={sunCenterX + baseDimension * 0.26 - baseDimension * 0.025}
                    y={sunCenterY + baseDimension * 0.08 - baseDimension * 0.025}
                    width={baseDimension * 0.05}
                    height={baseDimension * 0.05}
                    style={{ pointerEvents: 'none' }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Mail
                        color={isDarkMode ? "white" : "black"}
                        size="100%"
                        strokeWidth={1.5}
                      />
                    </div>
                  </foreignObject>
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
                const angle = getPlanetAngle(project.orbitIndex);

                // Create full elliptical orbit that goes around the back of the sun
                // Use ellipse instead of arc for full 3D effect
                const ellipseRx = radius; // Horizontal radius
                const ellipseRy = radius * 0.65; // Vertical radius (compressed for 3D perspective)

                // Calculate planet position on this elliptical orbit
                const position = getPlanetPosition(ellipseRx, ellipseRy, sunCenterX, sunCenterY, angle);
                const planetRadius = baseDimension * (project.planetSize || 0.07); // Use custom size or default

                // Determine planet color based on theme
                const planetColor = isDarkMode
                  ? `0 0% ${20 + (project.orbitIndex * 10)}%` // Monochrome: dark grey to darker grey
                  : project.accentColor; // Original colors

                return (
                  <g key={`orbit-planet-${project.id}`}>
                    {/* Full elliptical orbit path - responsive stroke but thicker */}
                    <ellipse
                      cx={sunCenterX}
                      cy={sunCenterY}
                      rx={ellipseRx}
                      ry={ellipseRy}
                      fill="none"
                      stroke={isDarkMode ? "rgba(0, 0, 0, 0.5)" : "url(#orbitGradient)"}
                      strokeWidth={baseDimension * 0.003} // Increased from 0.001 to 0.003
                      strokeDasharray="18 28"
                      opacity="0.7"
                      style={{
                        filter: isDarkMode ? 'none' : 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
                        transition: 'stroke 0.5s ease, filter 0.5s ease'
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
                        {/* Planet rendering - Images for all planets */}
                        {(() => {
                          switch (project.id) {
                            case "1":
                              return (
                                <image
                                  href={isDarkMode ? "/lavaworlddark.gif" : "/Terran%20Dry%20-%202161106751.gif"}
                                  x={-planetRadius}
                                  y={-planetRadius}
                                  width={planetRadius * 2}
                                  height={planetRadius * 2}
                                  preserveAspectRatio="xMidYMid slice"
                                  style={{
                                    filter: isDarkMode ? 'brightness(0.9) contrast(1.2)' : 'brightness(1.1) contrast(1.1)',
                                    transition: 'filter 0.5s ease'
                                  }}
                                />
                              );
                            case "2":
                              return (
                                <image
                                  href={isDarkMode ? "/gasgiant1dark.gif" : "/Gas%20giant%201%20-%202161106751.gif"}
                                  x={-planetRadius}
                                  y={-planetRadius}
                                  width={planetRadius * 2}
                                  height={planetRadius * 2}
                                  preserveAspectRatio="xMidYMid slice"
                                  style={{
                                    filter: isDarkMode ? 'brightness(0.9) contrast(1.2)' : 'brightness(1.1) contrast(1.1)',
                                    transition: 'filter 0.5s ease'
                                  }}
                                />
                              );
                            case "3":
                              return (
                                <image
                                  href={isDarkMode ? "/terrenwetdark.gif" : "/Terran%20Wet%20-%203370142330.gif"}
                                  x={-planetRadius}
                                  y={-planetRadius}
                                  width={planetRadius * 2}
                                  height={planetRadius * 2}
                                  preserveAspectRatio="xMidYMid slice"
                                  style={{
                                    filter: isDarkMode ? 'brightness(0.9) contrast(1.2)' : 'brightness(1.1) contrast(1.1)',
                                    transition: 'filter 0.5s ease'
                                  }}
                                />
                              );
                            case "4":
                              return (
                                <image
                                  href={isDarkMode ? "/gasgiantdark.gif" : "/Gas%20giant%202%20-%202161106751.gif"}
                                  x={-planetRadius}
                                  y={-planetRadius}
                                  width={planetRadius * 2}
                                  height={planetRadius * 2}
                                  preserveAspectRatio="xMidYMid slice"
                                  style={{
                                    filter: isDarkMode ? 'brightness(0.9) contrast(1.2)' : 'brightness(1.1) contrast(1.1)',
                                    transition: 'filter 0.5s ease'
                                  }}
                                />
                              );
                            case "5":
                              return (
                                <image
                                  href={isDarkMode ? "/iceworlddark.gif" : "/Ice%20World%20-%2073626106.gif"}
                                  x={-planetRadius}
                                  y={-planetRadius}
                                  width={planetRadius * 2}
                                  height={planetRadius * 2}
                                  preserveAspectRatio="xMidYMid slice"
                                  style={{
                                    filter: isDarkMode ? 'brightness(0.9) contrast(1.2)' : 'brightness(1.1) contrast(1.1)',
                                    transition: 'filter 0.5s ease'
                                  }}
                                />
                              );
                            default:
                              return (
                                <circle
                                  r={planetRadius}
                                  fill={project.accentColor}
                                  className="transition-all duration-300"
                                />
                              );
                          }
                        })()}
                      </g>
                      {/* Project title text - responsive font size and positioning */}
                      <text
                        x="0"
                        y={planetRadius + baseDimension * 0.05}
                        textAnchor="middle"
                        fill={isDarkMode ? "#000000" : "white"}
                        fontSize={baseDimension * 0.030} // 0.6% of smaller viewport
                        fontWeight="500"
                        className="drop-shadow-lg pointer-events-none"
                        style={{
                          transition: 'fill 0.5s ease'
                        }}
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

      {/* Meteor Cursor */}
      <MeteorCursor />
    </section>
  );
};

export default SolarSystem;
