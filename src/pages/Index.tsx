import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Hero from "@/components/Hero";
import SolarSystem from "@/components/SolarSystem";
import Stars from "@/components/Stars";
import ProjectPanel from "@/components/ProjectPanel";
import { DynamicNavbar, NavbarViewMode } from "@/components/DynamicNavbar";
import { PlanetProject } from "@/components/Planet";
import WarpTunnel, { WarpParams } from "@/components/WarpTunnel";
import { toLegacyProjects } from "@/data/projects";
import { ExternalLink, Github, Mail, Linkedin, Twitter } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWindowSize } from "@/hooks/use-window-size";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);
  const [navMode, setNavMode] = useState<NavbarViewMode>('default');
  const { isDarkMode } = useTheme();
  const dimensions = useWindowSize();

  // Projects Data
  const projectsData = toLegacyProjects();

  const containerRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const eventHorizonRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const solarSystemRef = useRef<HTMLDivElement>(null);
  const sceneWrapperRef = useRef<HTMLDivElement>(null);
  const warpParamsRef = useRef<WarpParams>({ chromatic: 0 });
  const masterSvgRef = useRef<HTMLDivElement>(null);
  const masterPathRef = useRef<SVGPathElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);

  // Phase 3 Refs array
  const flybyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const massivePlanetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sidebarNodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Navigation State storage for GSAP progress
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const totalScrollRef = useRef<number>(0);

  // Mathematical generation of the single seamless tracking flight path
  const masterFlightPathD = useMemo(() => {
    if (dimensions.width === 0) return "";
    const cw = dimensions.width;
    const ch = dimensions.height;
    
    // Line originates from the top center
    let d = `M ${cw * 0.5} 0`; 
    
    projectsData.forEach((project, i) => {
       const isLeft = i % 2 === 0;
       const px = isLeft ? cw * 0.25 : cw * 0.75;
       const py = (i * ch) + (ch * 0.5);
       const prevX = i === 0 ? cw * 0.5 : (i % 2 === 0 ? cw * 0.75 : cw * 0.25);
       const prevY = i === 0 ? 0 : ((i - 1) * ch) + (ch * 0.5);
       
       // Vertical tangents for mathematically smooth continuous S-curves
       d += ` C ${prevX} ${prevY + ch * 0.4}, ${px} ${py - ch * 0.4}, ${px} ${py}`;
    });
    
    // Final exit tail off the bottom of the system
    const lastIndex = projectsData.length - 1;
    const lastX = lastIndex % 2 === 0 ? cw * 0.25 : cw * 0.75;
    const lastY = (lastIndex * ch) + (ch * 0.5);
    d += ` C ${lastX} ${lastY + ch * 0.4}, ${cw * 0.5} ${(lastIndex + 1) * ch}, ${cw * 0.5} ${(lastIndex + 1.5) * ch}`;
    
    return d;
  }, [dimensions, projectsData.length]);

  useEffect(() => {
    if (!containerRef.current) return;

    let ctx = gsap.context(() => {
      // Calculate total scroll depth flexibly based on number of projects
      // 2000 for phase 1 & 2. 1500 for each project. 1500 for outro.
      const totalScroll = 2000 + (projectsData.length * 1500) + 1500;
      totalScrollRef.current = totalScroll;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalScroll}`,
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            const progress = self.progress;

            // --- Animation Time-Based Logic ---
            if (timelineRef.current) {
              const t = timelineRef.current.time();
              
              // Dynamic Navbar Switch
              // The Event Horizon flash begins at 3.9 and scales up massively.
              // It physically engulfs the top navbar precisely around t = 4.4.
              if (t > 4.4) {
                setNavMode(prev => prev !== 'projects' ? 'projects' : prev);
              } else {
                setNavMode(prev => prev !== 'default' ? 'default' : prev);
              }

              // Project Sidebar Tracking
              let currentIdx = -1;
              projectsData.forEach((_, i) => {
                const center = 7.0 + (i * 4.0); // Exact visual center of the project phase
                if (t >= center - 2.0 && t <= center + 2.0) {
                  currentIdx = i;
                }
              });

              // Update Sidebar DOM nodes directly for maximum performance
              sidebarNodeRefs.current.forEach((btn, i) => {
                if (!btn) return;
                const ring = btn.querySelector('.active-ring');
                if (i === currentIdx) {
                  btn.classList.add('scale-110');
                  btn.classList.remove('scale-100', 'opacity-50');
                  if (ring) {
                    ring.classList.remove('opacity-0', 'scale-50');
                    ring.classList.add('opacity-100', 'scale-100');
                  }
                } else {
                  btn.classList.add('scale-100', 'opacity-50');
                  btn.classList.remove('scale-110');
                  if (ring) {
                    ring.classList.add('opacity-0', 'scale-50');
                    ring.classList.remove('opacity-100', 'scale-100');
                  }
                }
              });

              // Fade in/out the entire sidebar explicitly during Phase 3
              const sidebarParent = document.getElementById('project-sidebar');
              if (sidebarParent) {
                const isPhase3 = t >= 4.5 && t <= (25.0); // Between Event Horizon and Outro
                sidebarParent.style.opacity = isPhase3 ? '1' : '0';
                sidebarParent.style.pointerEvents = isPhase3 ? 'auto' : 'none';
              }

              // Update the vertical track "progress filler" line
              const fillLine = document.getElementById('project-sidebar-fill');
              if (fillLine) {
                const startT = 5.0; // Start of Phase 3
                const endT = 7.0 + ((projectsData.length - 1) * 4.0) + 2.0; // End of final node interaction
                let fillPercent = 0;
                if (t <= startT) fillPercent = 0;
                else if (t >= endT) fillPercent = 100;
                else fillPercent = ((t - startT) / (endT - startT)) * 100;
                
                fillLine.style.height = `${fillPercent}%`;
              }
            }

            // Animate Massive Planets (if they exist in the DOM)
            const frame = Math.floor(progress * 149);
            massivePlanetRefs.current.forEach((el) => {
              if (el) {
                const W = 600;
                const xPos = -(frame % 50) * W;
                const yPos = -Math.floor(frame / 50) * W;
                el.style.backgroundPosition = `${xPos}px ${yPos}px`;
              }
            });
          }
        }
      });

      // Dedicated ScrollTrigger for G-Force Shake (Phase 1 Cinematic Rumble)
      let shakeTween: gsap.core.Tween;
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=1200px", // Shakes until warp ends
        onEnter: () => {
          shakeTween = gsap.to(shakeRef.current, { x: "random(-4, 4)", y: "random(-4, 4)", duration: 0.05, repeat: -1, yoyo: true });
        },
        onLeave: () => {
          if (shakeTween) shakeTween.kill();
          gsap.to(shakeRef.current, { x: 0, y: 0, duration: 0.1 });
        },
        onEnterBack: () => {
          shakeTween = gsap.to(shakeRef.current, { x: "random(-4, 4)", y: "random(-4, 4)", duration: 0.05, repeat: -1, yoyo: true });
        },
        onLeaveBack: () => {
          if (shakeTween) shakeTween.kill();
          gsap.to(shakeRef.current, { x: 0, y: 0, duration: 0.1 });
        }
      });

      // PHASE 1: Warp / Hero fading out
      // Starts after a tiny initial scroll (time = 0.2)
      tl.fromTo(warpRef.current, { opacity: 0, scale: 1 }, { opacity: 0.8, duration: 0.2 }, 0.2);
      // Warp continuous acceleration spans the entire Phase 2
      tl.to(warpRef.current, { scale: 4, ease: "power2.in", duration: 3.5 }, 0.4);
      
      // Cinematic Vignette enters to create tunnel vision (no grain requested)
      tl.fromTo(vignetteRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.2);
      tl.to(vignetteRef.current, { opacity: 0, duration: 0.4 }, 3.5);

      tl.to(heroRef.current, { opacity: 0, y: -200, scale: 1.2, filter: 'blur(10px)', duration: 1 }, 0.2);

      // PHASE 2: Solar System Zoom In and Sun Ignition
      // Rotation starts at 0.7 and ends at 3.9
      tl.fromTo(sceneWrapperRef.current,
        { scale: 1, x: '0vw', y: '0vh', rotation: 0 },
        { scale: 1.72, x: '10vw', y: '25vh', rotation: 75, duration: 3.2, ease: "power1.inOut" },
        0.7);

      // Halfway through rotation, the chromatic aberration flares up
      tl.to(warpParamsRef.current, { chromatic: 1, duration: 1.5, ease: "power1.in" }, 2.0);

      // PHASE 2 CLIMAX: Event Horizon Portal Transition
      // The ring starts tiny and expands massively to wipe the solar system away
      tl.fromTo(eventHorizonRef.current,
        { scale: 0, opacity: 0 },
        { scale: 30, opacity: 1, duration: 1.7, ease: "power2.inOut" },
        3.9
      );
      // As the ring edge washes over the scene, fade out the solar system
      tl.to(solarSystemRef.current, { opacity: 0, filter: 'blur(40px)', duration: 0.8 }, 4.1);
      // Once fully expanded, fade the ring itself out — leaving clean deep space
      tl.to(eventHorizonRef.current, { opacity: 0, duration: 0.6 }, 4.6);

      // Draw the master orbit track as the event horizon fades, revealing the projects
      tl.set(masterPathRef.current, { strokeDasharray: 12000, strokeDashoffset: 12000 }, 4.6);
      tl.to(masterPathRef.current, { strokeDashoffset: 0, duration: 2.5, ease: "power2.out" }, 4.7);


      // PHASE 3: Project Flybys — starts after event horizon fades
      let time = 5.0;

      projectsData.forEach((project, i) => {
        const flybyWrapper = flybyRefs.current[i];
        const planetEl = massivePlanetRefs.current[i];
        const textEl = textRefs.current[i];

        if (!flybyWrapper || !planetEl || !textEl) return;

        // Intro
        tl.fromTo(flybyWrapper, { opacity: 0, pointerEvents: "none" }, { opacity: 1, pointerEvents: "auto", duration: 0.1 }, time);

        const isPlanetLeft = i % 2 === 0;
        const entryX = isPlanetLeft ? "50vw" : "-50vw";
        const exitX = isPlanetLeft ? "-50vw" : "50vw";

        // Planet sweeps in and grows
        tl.fromTo(planetEl,
          { scale: 0.1, x: entryX, opacity: 0, rotation: -90 },
          { scale: 1, x: "0vw", opacity: 1, rotation: 0, duration: 1.5, ease: "power3.out" },
          time);

        // Text fades in from the side shortly after
        tl.fromTo(textEl,
          { opacity: 0, x: isPlanetLeft ? 100 : -100, filter: 'blur(10px)' },
          { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1, ease: "power2.out" },
          time + 0.5);

        // Holding period for reading
        time += 2.5;

        // Outro (sweep out)
        tl.to(planetEl, { scale: 1.5, x: exitX, opacity: 0, filter: 'blur(20px)', duration: 1.5, ease: "power3.in" }, time);
        
        // As we exit this planet and head to the next, physically pan the massive master SVG down seamlessly!
        if (i < projectsData.length - 1) {
          tl.to(masterSvgRef.current, { y: -((i + 1) * dimensions.height), duration: 3.0, ease: "power2.inOut" }, time);
        }

        tl.to(textEl, { opacity: 0, x: isPlanetLeft ? -100 : 100, filter: 'blur(10px)', duration: 1, ease: "power2.in" }, time);
        tl.set(flybyWrapper, { pointerEvents: "none" }, time + 1.5); // Hide wrapper

        time += 1.5; // Stacking next element seamlessly
      });

      // PHASE 4: Outro Vaporization
      // Trace the wire to the exact center of the screen
      tl.to(masterSvgRef.current, { y: -(projectsData.length * dimensions.height), duration: 2.0, ease: "power2.inOut" }, time);

      // Vaporize the track into bright glowing dust
      tl.to(masterSvgRef.current, { opacity: 0, filter: 'blur(30px) brightness(2)', duration: 1.5, ease: "power2.in" }, time + 1.0);

      // Fade in Contact screen smoothly as the screen vaporizes
      tl.fromTo(outroRef.current, 
        { opacity: 0, scale: 0.9, y: 50, pointerEvents: "none" },
        { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "power3.out", pointerEvents: "auto" },
        time + 1.2
      );
      
      timelineRef.current = tl;

    }, containerRef);

    return () => ctx.revert();
  }, [projectsData.length, dimensions]); // Rebuild when dimensions change strictly for responsive heights

  // Click handler for Sidebar navigation
  const handleSidebarClick = (index: number) => {
    if (!timelineRef.current) return;
    
    const tl = timelineRef.current;
    
    // The exact visual center of project `index` is 7.0 + i*4.0 in GSAP time units
    const targetTime = 7.0 + (index * 4.0);
    const progressPercentage = targetTime / tl.duration();
    const targetScroll = progressPercentage * totalScrollRef.current;
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen font-sans" style={{
      backgroundColor: isDarkMode ? '#ffffff' : 'transparent',
      transition: 'background-color 1.7s ease-in-out'
    }}>
      <Stars />

      {/* Navigation Bar - Stays on top */}
      <div className="relative z-[100]">
        <DynamicNavbar viewMode={navMode} />
      </div>

      <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-transparent">
        <div ref={shakeRef} className="absolute inset-0 w-full h-full">

          {/* Project Progress Sidebar (Vertical Tracking) */}
          <div 
            id="project-sidebar" 
            className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center opacity-0 transition-opacity duration-500 pointer-events-none"
            style={{ height: `${projectsData.length * 110}px` }}
          >
            {/* Background Thin Line running vertically (Behind Nodes) */}
            <div className="absolute top-0 bottom-0 w-[2px] transition-colors duration-700 left-1/2 -translate-x-1/2 z-0" 
                 style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)' }} />

            {/* Active Progress Thicker Fill Line */}
            <div id="project-sidebar-fill" 
                 className="absolute top-0 w-[3px] transition-colors duration-700 left-1/2 -translate-x-1/2 z-[5] ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                 style={{ 
                   height: '0%', 
                   backgroundColor: isDarkMode ? '#000' : '#fff' 
                 }} />
            
            {/* Clickable Nodes Wrapper */}
            <div className="relative w-full h-full flex flex-col justify-between items-center py-10 z-10">
               {projectsData.map((project, i) => (
                 <button
                   key={`sidebar-node-${project.id}`}
                   ref={el => { if (sidebarNodeRefs.current) sidebarNodeRefs.current[i] = el; }}
                   onClick={() => handleSidebarClick(i)}
                   className="relative w-7 h-7 rounded-full border-0 outline-none transition-all duration-500 ease-out flex items-center justify-center opacity-50 shadow-lg"
                   style={{ backgroundColor: `hsl(${project.accentColor})` }}
                   aria-label={`Scroll to ${project.title}`}
                 >
                    {/* The Active Circular Outline Marker */}
                    <div className="active-ring absolute -inset-2 rounded-full border-[2.5px] opacity-0 scale-50 transition-all duration-500 shadow-md" 
                         style={{ borderColor: isDarkMode ? '#000' : '#fff' }} />
                 </button>
               ))}
            </div>
          </div>

          {/* Cinematic Vignette */}
          <div
            ref={vignetteRef}
            className="absolute inset-0 z-[15] pointer-events-none opacity-0"
            style={{
              background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.95) 100%)',
            }}
          />

          {/* Phase 1 Overlay (Warp Streaks) */}
          <div ref={warpRef} className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-0">
            <WarpTunnel params={warpParamsRef} />
          </div>

          {/* Event Horizon Portal Transition */}
          <div className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center overflow-hidden mix-blend-screen">
            <div
              ref={eventHorizonRef}
              className="rounded-full"
              style={{
                width: '150px',
                height: '150px',
                background: isDarkMode 
                  ? 'radial-gradient(circle, transparent 35%, rgba(0, 150, 255, 0.5) 43%, rgba(255, 255, 255, 1) 48%, rgba(255, 255, 255, 1) 52%, rgba(0, 200, 255, 0.8) 60%, rgba(0, 50, 200, 0.2) 75%, transparent 100%)'
                  : 'radial-gradient(circle, transparent 35%, rgba(255, 220, 0, 0.5) 43%, rgba(255, 255, 255, 1) 48%, rgba(255, 255, 255, 1) 52%, rgba(255, 120, 0, 0.8) 60%, rgba(255, 0, 0, 0.3) 75%, transparent 100%)',
                filter: 'blur(6px)',
                opacity: 0,
                transform: 'scale(0)',
              }}
            />
          </div>

          {/* Phase 2 Overlay (Solar System Scale Target) */}
          <div ref={sceneWrapperRef} className="absolute inset-0 w-full h-full origin-center">
            <div ref={heroRef} className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              <Hero />
            </div>

            <div ref={solarSystemRef} className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto w-full h-full">
                <SolarSystem
                  selectedProject={selectedProject}
                  setSelectedProject={setSelectedProject}
                />
              </div>
            </div>
          </div>

          {/* Phase 3 Overlays (Full Screen Ship Spotlights) */}
          <div className="absolute inset-0 z-40">
            
            {/* The Unified Seamless Track */}
            <div 
              ref={masterSvgRef}
              className="absolute left-0 top-0 w-full pointer-events-none z-0"
              style={{ height: `${projectsData.length * 100}vh` }}
            >
               <svg className="w-full h-full" preserveAspectRatio="xMidYMin slice">
                  <path 
                    ref={masterPathRef}
                    d={masterFlightPathD}
                    stroke="white"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="12000"
                    strokeDashoffset="12000"
                    className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  />
               </svg>
            </div>

            {projectsData.map((project, index) => {
              let spriteUrl = "";
              switch (project.id) {
                case "1": spriteUrl = isDarkMode ? "/Lava%20World%20-%201909546053%20-%20spritesheet.png" : "/Terran%20Dry%20-%203542928846%20-%20spritesheet.png"; break;
                case "2": spriteUrl = "/Gas%20giant%201%20-%203542928846%20-%20spritesheet.png"; break;
                case "3": spriteUrl = "/Terran%20Wet%20-%203542928846%20-%20spritesheet.png"; break;
                case "4": spriteUrl = "/Gas%20giant%202%20-%203417044678%20-%20spritesheet.png"; break;
                case "5": spriteUrl = "/Ice%20World%20-%201909546053%20-%20spritesheet.png"; break;
              }

              // We alternate planet side to justify the S-curve weave
              const isPlanetLeft = index % 2 === 0;

              const planetMarkup = (
                <div className="relative w-1/2 flex items-center justify-center">
                  <div
                    ref={(el) => massivePlanetRefs.current[index] = el}
                    className="relative origin-center z-10"
                    style={{
                      width: '600px',
                      height: '600px',
                      backgroundImage: `url('${spriteUrl}')`,
                      backgroundSize: `${600 * 50}px ${600 * 3}px`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: '0px 0px',
                      filter: isDarkMode ? 'brightness(0.9) contrast(1.2)' : 'brightness(1.1) contrast(1.1)',
                      borderRadius: '50%',
                      boxShadow: `0 0 100px -20px ${project.accentColor}`
                    }}
                  />
                </div>
              );

              const textMarkup = (
                <div
                  ref={(el) => textRefs.current[index] = el}
                  className={`w-1/2 flex flex-col gap-6 max-w-2xl px-8 ${isPlanetLeft ? 'items-start' : 'items-end text-right'}`}
                  style={{
                    color: isDarkMode ? '#000000' : '#ffffff'
                  }}
                >
                  <p
                    className="font-mono text-sm uppercase tracking-[0.3em] font-semibold"
                    style={{ color: project.accentColor }}
                  >
                    Dataset {index + 1} // Phase Render
                  </p>
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-2 leading-tight drop-shadow-md">
                    {project.title}
                  </h2>
                  <p className="text-xl md:text-2xl leading-relaxed font-light" style={{ color: isDarkMode ? '#444' : '#ccc' }}>
                    {project.description}
                  </p>

                  <div className={`flex flex-wrap gap-2 my-4 ${isPlanetLeft ? 'justify-start' : 'justify-end'}`}>
                    {project.stack.map(tech => (
                      <span
                        key={tech}
                        className={`px-3 py-1 text-sm border rounded-full ${isDarkMode ? 'bg-black/5 border-black/20' : 'bg-white/10 border-white/20'}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className={`flex gap-4 mt-2 ${isPlanetLeft ? 'justify-start' : 'justify-end'}`}>
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all hover:scale-105 border ${isDarkMode ? 'border-black/20 hover:bg-black/5' : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
                      >
                        <Github size={20} /> Repository
                      </a>
                    )}
                    {project.links.live && (
                      <a
                        href={project.links.live}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
                        style={{ backgroundColor: project.accentColor, color: isDarkMode ? '#fff' : '#000' }}
                      >
                        <ExternalLink size={20} /> Open Project
                      </a>
                    )}
                  </div>
                </div>
              );

              return (
                <div
                  key={project.id}
                  ref={(el) => flybyRefs.current[index] = el}
                  className="absolute inset-0 flex items-center justify-between px-10 md:px-24 opacity-0 pointer-events-none z-10"
                >
                  {isPlanetLeft ? (
                    <>
                      {planetMarkup}
                      {textMarkup}
                    </>
                  ) : (
                    <>
                      {textMarkup}
                      {planetMarkup}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Scroll Instruction Overlay */}
          {!selectedProject && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                bottom: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="relative animate-pulse flex flex-col items-center gap-2">
                <p className="text-xs uppercase tracking-widest font-medium" style={{ color: isDarkMode ? '#000' : '#fff', opacity: 0.5 }}>
                  Scroll down to investigate
                </p>
                <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-current to-transparent" style={{ color: isDarkMode ? '#000' : '#fff' }}></div>
              </div>
            </div>
          )}

          {/* Phase 4 Outro (Vaporized Contact Page) */}
          <div 
            ref={outroRef}
            className="absolute inset-0 z-[70] flex items-center justify-center opacity-0 pointer-events-none"
          >
            <div className="text-center max-w-3xl px-6">
              <h2 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 drop-shadow-md" style={{ color: isDarkMode ? '#000' : '#fff' }}>
                Wanna know more<br/>about me?
              </h2>
              <p className="text-xl md:text-2xl mb-12 font-light" style={{ color: isDarkMode ? '#444' : '#ccc' }}>
                Let's build something incredible. Reach out across the void.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a 
                  href="mailto:contact@example.com"
                  className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-transform hover:scale-105"
                  style={{ 
                    backgroundColor: isDarkMode ? '#000' : '#fff', 
                    color: isDarkMode ? '#fff' : '#000' 
                  }}
                >
                  <Mail size={24} /> Mail Me
                </a>
                <div className="flex gap-4">
                  <a href="#" className={`p-4 rounded-full transition-transform hover:scale-110 hover:-translate-y-1 ${isDarkMode ? 'bg-black/5 text-black' : 'bg-white/10 text-white'}`}>
                    <Github size={24} />
                  </a>
                  <a href="#" className={`p-4 rounded-full transition-transform hover:scale-110 hover:-translate-y-1 ${isDarkMode ? 'bg-black/5 text-black' : 'bg-white/10 text-white'}`}>
                    <Linkedin size={24} />
                  </a>
                  <a href="#" className={`p-4 rounded-full transition-transform hover:scale-110 hover:-translate-y-1 ${isDarkMode ? 'bg-black/5 text-black' : 'bg-white/10 text-white'}`}>
                    <Twitter size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {selectedProject && (
        <ProjectPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Spotify Footer */}
      <div className="fixed bottom-4 right-4 z-[100] opacity-15 hover:opacity-80 transition-opacity duration-300">
        <iframe
          data-testid="embed-iframe"
          style={{ borderRadius: '12px' }}
          src="https://open.spotify.com/embed/track/6pWgRkpqVfxnj3WuIcJ7WP?utm_source=generator&theme=0"
          width="300"
          height="80"
          frameBorder="0"
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media;"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Index;
