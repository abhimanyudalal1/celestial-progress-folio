import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Hero from "@/components/Hero";
import SolarSystem from "@/components/SolarSystem";
import Stars from "@/components/Stars";
import ProjectPanel from "@/components/ProjectPanel";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import { PlanetProject } from "@/components/Planet";
import WarpTunnel from "@/components/WarpTunnel";
import { toLegacyProjects } from "@/data/projects";
import { ExternalLink, Github } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<PlanetProject | null>(null);
  const { isDarkMode } = useTheme();

  // Projects Data
  const projectsData = toLegacyProjects();

  const containerRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const solarSystemRef = useRef<HTMLDivElement>(null);
  const sceneWrapperRef = useRef<HTMLDivElement>(null);
  
  // Phase 3 Refs array
  const flybyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const massivePlanetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    let ctx = gsap.context(() => {
      // Calculate total scroll depth flexibly based on number of projects
      // 2000 for phase 1 & 2. 1500 for each project.
      const totalScroll = 2000 + (projectsData.length * 1500);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${totalScroll}`,
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
             // Animate Massive Planets (if they exist in the DOM)
             const progress = self.progress;
             const frame = Math.floor(progress * 149);
             massivePlanetRefs.current.forEach((el) => {
               if (el) {
                 // Massive planet assumes a scale or width - let's render it 600x600 px grid
                 // Grid is 50x3.
                 const W = 600; 
                 const xPos = -(frame % 50) * W;
                 const yPos = -Math.floor(frame / 50) * W;
                 el.style.backgroundPosition = `${xPos}px ${yPos}px`;
               }
             });
          }
        }
      });

      // PHASE 1: Warp / Hero fading out
      // Starts immediately (time = 0)
      tl.to(warpRef.current, { opacity: 0, scale: 2.5, duration: 1, ease: "power2.in" }, 0);
      tl.to(heroRef.current, { opacity: 0, y: -200, scale: 1.2, filter: 'blur(10px)', duration: 1 }, 0);

      // PHASE 2: Solar System Zoom In and Sun Ignition
      tl.fromTo(sceneWrapperRef.current, 
        { scale: 1, y: '0vh', rotation: 0 }, 
        { scale: 4.5, y: '45vh', rotation: 35, duration: 2, ease: "power2.inOut" }, 
      0.5);

      tl.to(solarSystemRef.current, { opacity: 0, filter: 'blur(30px)', duration: 1 }, 2.5);

      // PHASE 3: Project Flybys
      // Each block takes about 2 units of time in GSAP timeline logic
      let time = 3.5; 

      projectsData.forEach((project, i) => {
        const flybyWrapper = flybyRefs.current[i];
        const planetEl = massivePlanetRefs.current[i];
        const textEl = textRefs.current[i];
        
        if (!flybyWrapper || !planetEl || !textEl) return;

        // Intro
        tl.fromTo(flybyWrapper, { opacity: 0, pointerEvents: "none" }, { opacity: 1, pointerEvents: "auto", duration: 0.1 }, time);

        // Planet sweeps in and grows
        tl.fromTo(planetEl, 
          { scale: 0.1, x: "50vw", opacity: 0, rotation: -90 }, 
          { scale: 1, x: "0vw", opacity: 1, rotation: 0, duration: 1.5, ease: "power3.out" }, 
        time);

        // Text fades in from the right shortly after
        tl.fromTo(textEl, 
          { opacity: 0, x: 100, filter: 'blur(10px)' }, 
          { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1, ease: "power2.out" }, 
        time + 0.5);

        // Holding period for reading
        time += 2.5;

        // Outro (sweep out)
        tl.to(planetEl, { scale: 1.5, x: "-50vw", opacity: 0, filter: 'blur(20px)', duration: 1.5, ease: "power3.in" }, time);
        tl.to(textEl, { opacity: 0, x: -100, filter: 'blur(10px)', duration: 1, ease: "power2.in" }, time);
        tl.set(flybyWrapper, { pointerEvents: "none" }, time + 1.5); // Hide wrapper

        time += 1.5; // Stacking next element seamlessly
      });

    }, containerRef);

    return () => ctx.revert();
  }, [projectsData.length]);

  return (
    <div className="min-h-screen font-sans" style={{ 
      backgroundColor: isDarkMode ? '#ffffff' : 'transparent',
      transition: 'background-color 1.7s ease-in-out'
    }}>
      <Stars />
      
      <div className="relative z-[100]">
        <MiniNavbar />
      </div>

      <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-transparent">
        
        {/* Phase 1 Overlay */}
        <div ref={warpRef} className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-70">
           <WarpTunnel />
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
          {projectsData.map((project, index) => {
            let spriteUrl = "";
            switch (project.id) {
              case "1": spriteUrl = isDarkMode ? "/Lava%20World%20-%201909546053%20-%20spritesheet.png" : "/Terran%20Dry%20-%203542928846%20-%20spritesheet.png"; break;
              case "2": spriteUrl = "/Gas%20giant%201%20-%203542928846%20-%20spritesheet.png"; break;
              case "3": spriteUrl = "/Terran%20Wet%20-%203542928846%20-%20spritesheet.png"; break;
              case "4": spriteUrl = "/Gas%20giant%202%20-%203417044678%20-%20spritesheet.png"; break;
              case "5": spriteUrl = "/Ice%20World%20-%201909546053%20-%20spritesheet.png"; break;
            }

            return (
              <div 
                key={project.id}
                ref={(el) => flybyRefs.current[index] = el}
                className="absolute inset-0 flex items-center justify-between px-10 md:px-24 opacity-0 pointer-events-none"
              >
                {/* Left Side: Massive Planet */}
                <div className="w-1/2 flex items-center justify-center">
                  <div
                    ref={(el) => massivePlanetRefs.current[index] = el}
                    // Fixed 600x600 px target size for the spritesheet division math 
                    className="relative origin-center"
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

                {/* Right Side: Project Information */}
                <div 
                  ref={(el) => textRefs.current[index] = el}
                  className="w-1/2 flex flex-col items-start gap-6 max-w-2xl px-8"
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

                  <div className="flex flex-wrap gap-2 my-4">
                    {project.stack.map(tech => (
                      <span 
                        key={tech} 
                        className={`px-3 py-1 text-sm border rounded-full ${isDarkMode ? 'bg-black/5 border-black/20' : 'bg-white/10 border-white/20'}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-2">
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
