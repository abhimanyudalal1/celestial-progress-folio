import { PlanetProject } from "./Planet";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
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

import { useWindowSize } from '@/hooks/use-window-size';

// ... (other imports)

const SolarSystem = ({ selectedProject, setSelectedProject }: SolarSystemProps) => {
  const dimensions = useWindowSize(); // Debounced resize hook
  const { isDarkMode } = useTheme();

  // Refs for all planet sprites to update them efficiently via GSAP
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Ref for the continuously burning sun sprite
  const sunRef = useRef<SVGImageElement>(null);

  // Base dimension for responsive scaling
  const baseDimension = Math.min(dimensions.width, dimensions.height);

  const SUN_SCALE = isDarkMode ? 1.6 : 2.35; // Smaller in dark mode, normal in light mode

  // Unified Continuous Sprite Animation Loop for Sun and Planets (slow rotation)
  useEffect(() => {
    let animationFrameId: number;
    let startTime = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      // 1. Animate Sun (very slow)
      if (sunRef.current) {
        const sunFps = 5; // Extremely slow
        const frame = Math.floor(elapsed * sunFps) % 150; // 150 frames total
        const sunW = baseDimension * SUN_SCALE;
        if (sunW > 0) {
          const xPos = -(frame % 50) * sunW;
          const yPos = -Math.floor(frame / 50) * sunW;
          sunRef.current.setAttribute('x', `${xPos}`);
          sunRef.current.setAttribute('y', `${yPos}`);
        }
      }

      // 2. Animate Planets (slightly varying slow speeds)
      planetRefs.current.forEach((planetDiv, index) => {
        if (planetDiv) {
          const project = projects[index];
          if (!project) return;

          // Speeds vary slightly per planet e.g., 3.0, 2.7, 2.4, 2.1...
          const planetFps = 3.0 - (index * 0.3);
          const frame = Math.floor(elapsed * planetFps) % 150;

          const planetRadius = baseDimension * (project.planetSize || 0.07);
          const planetW = planetRadius * 2;

          const xPos = -(frame % 50) * planetW;
          const yPos = -Math.floor(frame / 50) * planetW;

          planetDiv.style.backgroundPosition = `${xPos}px ${yPos}px`;
        }
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [baseDimension, projects]);

  // SVG viewBox dimensions
  const { viewBoxWidth, viewBoxHeight, viewBoxLeft, sunCenterX, sunCenterY } = SOLAR_CONFIG;

  // Orbit radii
  const orbitRadii = getOrbitRadii(baseDimension);

  return (
    <section className="absolute inset-0 flex items-center justify-start pointer-events-none z-10" aria-label="Projects Solar System">
      <div className="relative w-full h-full">
        {/* Clean Sun Element - NO 3D transformations */}
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox={`${viewBoxLeft} 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMinYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              left: 0,
              top: 0
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
              <g style={{ pointerEvents: 'auto' }}>
                <svg
                  x={sunCenterX - baseDimension * (SUN_SCALE / 2)}
                  y={sunCenterY - baseDimension * (SUN_SCALE / 2)}
                  width={baseDimension * SUN_SCALE}
                  height={baseDimension * SUN_SCALE}
                  overflow="hidden"
                  viewBox={`0 0 ${baseDimension * SUN_SCALE} ${baseDimension * SUN_SCALE}`}
                >
                  {isDarkMode ? (
                    <image
                      ref={sunRef}
                      href="/Star%20-%20188959248%20-%20spritesheet.png"
                      width={baseDimension * SUN_SCALE * 50}
                      height={baseDimension * SUN_SCALE * 3}
                      preserveAspectRatio="none"
                      style={{
                        filter: 'contrast(1.1) brightness(1.2)'
                      }}
                    />
                  ) : (
                    <>
                      <image
                        href="/stargif.gif"
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid slice"
                        style={{
                          mixBlendMode: 'screen',
                          filter: 'brightness(1.5)'
                        }}
                      />
                      <image
                        href="/starhd.png"
                        x="10%"
                        y="10%"
                        width="80%"
                        height="80%"
                        preserveAspectRatio="xMidYMid meet"
                        style={{
                          filter: 'brightness(1.2) drop-shadow(0 0 30px rgba(255,200,50,0.6))'
                        }}
                      />
                    </>
                  )}
                </svg>
              </g>

              {/* Hero text content - NO transformations */}
              <g>
                {/* Name - DOUBLED font size */}
                <text
                  x={sunCenterX + baseDimension * 0.16}
                  y={sunCenterY - baseDimension * 0.03}
                  textAnchor="middle"
                  fill={isDarkMode ? "#000000" : "#ffffff"}
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
                  fill={isDarkMode ? "rgba(0, 0, 0, 0.95)" : "rgba(255, 255, 255, 0.95)"}
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
                    fill={isDarkMode ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)"}
                    stroke={isDarkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)"}
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
                        color={isDarkMode ? "black" : "white"}
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
                    fill={isDarkMode ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)"}
                    stroke={isDarkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)"}
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
                        color={isDarkMode ? "black" : "white"}
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
                    fill={isDarkMode ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)"}
                    stroke={isDarkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)"}
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
                        color={isDarkMode ? "black" : "white"}
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
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
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
                          let spriteUrl = "";
                          switch (project.id) {
                            case "1":
                              spriteUrl = isDarkMode ? "/Islands%20-%20330873532%20-%20spritesheetdark.png" : "/Lava%20World%20-%201909546053%20-%20spritesheet.png";
                              break;
                            case "2":
                              spriteUrl = isDarkMode ? "/Gas%20giant%202%20-%20330873532%20-%20spritesheetdark.png" : "/Gas%20giant%201%20-%203542928846%20-%20spritesheet.png";
                              break;
                            case "3":
                              spriteUrl = isDarkMode ? "/Terran%20Wet%20-%20330873532%20-%20spritesheetdark.png" : "/Terran%20Wet%20-%203542928846%20-%20spritesheet.png";
                              break;
                            case "4":
                              spriteUrl = isDarkMode ? "/Terran%20Dry%20-%20330873532%20-%20spritesheetdark.png" : "/Terran%20Dry%20-%203542928846%20-%20spritesheet.png";
                              break;
                            case "5":
                              spriteUrl = isDarkMode ? "/Ice%20World%20-%20330873532%20-%20spritesheetdark.png" : "/Ice%20World%20-%201909546053%20-%20spritesheet.png";
                              break;
                            default:
                              return (
                                <circle
                                  r={planetRadius}
                                  fill={project.accentColor}
                                  className="transition-all duration-300"
                                />
                              );
                          }

                          // Wait until refs are assigned before the style is applied via GSAP, 
                          // but give it an initial state
                          return (
                            <foreignObject
                              x={-planetRadius}
                              y={-planetRadius}
                              width={planetRadius * 2}
                              height={planetRadius * 2}
                              style={{
                                filter: isDarkMode ? 'brightness(0.9) contrast(1.2)' : 'brightness(1.1) contrast(1.1)',
                                transition: 'filter 0.5s ease',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                cursor: 'pointer'
                              }}
                              className="pointer-events-auto"
                              onClick={() => setSelectedProject(project)}
                            >
                              <div
                                ref={(el) => planetRefs.current[index] = el}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundImage: `url('${spriteUrl}')`,
                                  // Grid is 50 columns by 3 rows
                                  backgroundSize: `${planetRadius * 2 * 50}px ${planetRadius * 2 * 3}px`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: '0px 0px'
                                }}
                              />
                            </foreignObject>
                          );
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
