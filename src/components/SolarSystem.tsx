import { PlanetProject } from "./Planet";
import Planet from "./Planet";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import MeteorCursor from "./MeteorCursor";
import { Github, Linkedin, Mail } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    planetSize: 0.08, // Small planet (Mercury-like)
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
    planetSize: 0.09, // Small-medium planet (Venus-like)
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
    planetSize: 0.105, // Medium planet (Earth-like)
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
    planetSize: 0.215, // Small-medium planet (Mars-like)
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
    planetSize: 0.11, // Large planet (Jupiter-like)
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

  const containerRef = useRef<HTMLDivElement>(null);
  const solarSystemRef = useRef<HTMLElement>(null);
  const planetRefs = useRef<(SVGGElement | null)[]>([]);

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

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Animate all planets
      projects.forEach((project, index) => {
        const planetEl = planetRefs.current[index];
        if (planetEl) {
          const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
          const ellipseRx = radius;
          const ellipseRy = radius * 0.65;

          // Calculate initial angle
          const baseAngle = 300;
          const angleStep = 21;
          let initialAngle;
          if (project.orbitIndex === 1) {
            initialAngle = 298;
          } else {
            initialAngle = (baseAngle + (project.orbitIndex - 1) * angleStep) % 360;
          }

          // Calculate rotation amount based on radius (Kepler-like: closer = faster)

          // Choreograph end positions:
          // We want all planets to end at the "bottom" (approx 45 to 125 degrees)
          // Spread them out so they don't overlap.
          // P1: 45, P2: 65, P3: 85, P4: 105, P5: 125

          const targetAngle = 45 + (project.orbitIndex - 1) * 20;

          // Calculate shortest travel to target
          let travel = (targetAngle - initialAngle + 360) % 360;

          // Add extra rotations for speed effect
          // Planet 1 (Inner) gets 1 full orbit + travel
          // if (project.orbitIndex === 1) {
          //    travel += 360;
          // }
          // REMOVED EXTRA REVOLUTION AS PER USER REQUEST

          const targetRotation = initialAngle + travel;

          // Animation for ALL planets: Orbit then Drop
          const proxy = { angle: initialAngle, dropY: 0 };
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: solarSystemRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
            onUpdate: () => {
              const pos = getPlanetPosition(
                ellipseRx,
                ellipseRy,
                sunCenterX,
                sunCenterY,
                proxy.angle
              );
              if (planetEl) {
                gsap.set(planetEl, {
                  x: pos.x,
                  y: pos.y + proxy.dropY
                });
              }
            }
          });

          // First half: Orbit to target
          tl.to(proxy, {
            angle: targetRotation,
            duration: 0.5,
            ease: "none",
          });

          // Second half: Drop down to specific section
          // Section 1 is at 100vh (index 0)
          // Section 2 is at 180vh (index 1)
          // increment is 80vh
          const dropDistance = baseDimension * (1.5 + (index * 1.2)); // Adjusted multiplier to match vh spacing roughly

          tl.to(proxy, {
            dropY: dropDistance,
            duration: 0.5,
            ease: "power1.in", // Accelerate down
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [baseDimension, orbitRadii, sunCenterX, sunCenterY]);

  return (
    <div ref={containerRef} className="relative w-full z-10" style={{ height: '500vh' }}>
      {/* Scroll Spacer Boxes - Background Elements */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`spacer-${i}`}
            className="absolute left-0 w-full border-y border-white/10 backdrop-blur-[2px]"
            style={{
              top: `calc(${100 + (i * 80)}vh + 100px)`, // Starts at 100vh + 50px, then every 80vh
              height: '60vh',
              background: `url(/planet${i + 1}section.png)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="p-8 text-center opacity-30 font-mono text-sm">
              <p>Section {i + 1}</p>
            </div>
          </div>
        ))}
      </div>

      <section ref={solarSystemRef} className="relative h-screen w-full flex items-center justify-start z-50" style={{ overflow: 'visible' }} aria-label="Projects Solar System">
        <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
          {/* Clean Sun Element - NO 3D transformations */}
          <div className="absolute inset-0" style={{ overflow: 'visible' }}>
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
                overflow: 'visible',
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
                        ? 'scale(1.2) brightness(1.1) contrast(1.2) grayscale(100%) drop-shadow(0 0 0 transparent)' // Slight scale up for black hole
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
                        // mixBlendMode: 'screen', // Additive blending for glow effect
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
                        ref={(el) => { planetRefs.current[index] = el; }}
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
                                    href={isDarkMode ? "/lavaworlddark.gif" : "/terrandry.gif"}
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
                                    href={isDarkMode ? "/gasgiant1dark.gif" : "/gasgiant1.gif"}
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
                                    href={isDarkMode ? "/terrenwetdark.gif" : "/terrenwet.gif"}
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
    </div>
  );
};

export default SolarSystem;
