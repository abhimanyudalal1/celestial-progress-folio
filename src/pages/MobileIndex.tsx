import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Stars from "@/components/Stars";
import { DynamicNavbar, NavbarViewMode } from "@/components/DynamicNavbar";
import { toLegacyProjects } from "@/data/projects";
import { getPlanetSprite, SPRITE_COLS, SPRITE_FRAMES } from "@/lib/planet-sprites";
import { useWindowSize } from "@/hooks/use-window-size";
import { ExternalLink, Github, Mail, Linkedin, Twitter, Music, Download, ArrowUp } from "lucide-react";
import { Drawer } from "vaul";
import gsap from "gsap";

/**
 * MOBILE GRAND TOUR
 *
 * The desktop page is an orbital map seen from above — a camera panning across a
 * wide solar system. That composition is horizontal and dies in portrait. This is
 * the same tour rotated 90°: a plain vertical flight outward from the sun, one
 * full-screen planet encounter per project. No pinning, no scroll-scrubbing —
 * mobile URL bars resize the viewport mid-scroll and break both — just one-shot
 * entrance animations, a tappable tour rail, and the signature eye-blink jump.
 */

const SPRITE_FPS = 2.5;

// Hero status card — edit these when the situation changes
const HERO_STATUS = {
  now: "Intern @ IIT Bombay",
  focus: "ML · Fullstack",
};

/** Spritesheet planet that only burns rAF while it's actually on screen. */
const PlanetSprite = ({ spriteUrl, size }: { spriteUrl: string; size: number }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let running = false;
    const start = Date.now();
    let lastFrame = -1;

    const tick = () => {
      const frame = Math.floor(((Date.now() - start) / 1000) * SPRITE_FPS) % SPRITE_FRAMES;
      if (frame !== lastFrame) {
        lastFrame = frame;
        el.style.backgroundPosition = `${-(frame % SPRITE_COLS) * size}px ${-Math.floor(frame / SPRITE_COLS) * size}px`;
      }
      rafId = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        tick();
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    }, { rootMargin: "25%" });

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [spriteUrl, size]);

  return (
    <div
      ref={ref}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        backgroundImage: `url('${spriteUrl}')`,
        backgroundSize: `${size * SPRITE_COLS}px ${size * 3}px`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0px 0px",
      }}
    />
  );
};

const MobileIndex = () => {
  const { isDarkMode } = useTheme();
  const dimensions = useWindowSize();
  const projects = useMemo(() => toLegacyProjects(), []);
  const n = projects.length;

  const [navMode, setNavMode] = useState<NavbarViewMode>("default");
  // -1 = hero, 0..n-1 = planets, n = outro
  const [activeIdx, setActiveIdx] = useState(-1);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const outroRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const lidTopRef = useRef<HTMLDivElement>(null);
  const lidBottomRef = useRef<HTMLDivElement>(null);
  const blinkTlRef = useRef<gsap.core.Timeline | null>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const wipeTlRef = useRef<gsap.core.Timeline | null>(null);

  // Base planet size, gently varied per project so the system keeps its scale story
  const baseSize = Math.min(Math.round(dimensions.width * 0.5), 230) || 180;
  // Variance is deliberately gentler than the config values: the largest planet
  // must still leave room for its mission log inside one viewport
  const planetSizes = projects.map(p =>
    Math.round(baseSize * Math.min(1.05, 0.8 + (p.planetSize ?? 0.1) * 1.2))
  );

  // Warm the sprite + sun caches for the current theme (no loading gate — the page
  // is usable immediately; sprites just avoid popping in mid-scroll)
  useEffect(() => {
    const urls = [
      ...projects.map(p => getPlanetSprite(p.id, isDarkMode)).filter(Boolean) as string[],
      ...(isDarkMode ? ["/stardark.gif"] : ["/stargif.gif", "/starhd.png"]),
    ];
    urls.forEach(src => { const img = new Image(); img.src = src; });
  }, [isDarkMode, projects]);

  // One rAF-throttled scroll handler drives everything continuous: navbar handoff,
  // rail/pill/hint visibility, and the rail's progress fill. Direct style writes,
  // no re-renders.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const vh = window.innerHeight;

        setNavMode(prev => {
          const mode: NavbarViewMode = y > vh * 0.55 ? "projects" : "default";
          return prev === mode ? prev : mode;
        });

        const inTour = y > vh * 0.5;
        if (railRef.current) {
          railRef.current.style.opacity = inTour ? "1" : "0";
          railRef.current.style.pointerEvents = inTour ? "auto" : "none";
        }
        if (pillRef.current) {
          pillRef.current.style.opacity = inTour ? "1" : "0";
          pillRef.current.style.pointerEvents = inTour ? "auto" : "none";
        }
        if (hintRef.current) {
          hintRef.current.style.opacity = y < vh * 0.2 ? "1" : "0";
        }

        const first = sectionRefs.current[0];
        const last = sectionRefs.current[n - 1];
        if (first && last && fillRef.current) {
          const start = first.offsetTop - vh * 0.5;
          const end = last.offsetTop - vh * 0.5;
          const p = Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start)));
          fillRef.current.style.height = `${p * 100}%`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [n]);

  // IntersectionObserver: reveals each section once (adds .is-in) and tracks which
  // stop of the tour we're at for the rail dots.
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        const idx = Number((entry.target as HTMLElement).dataset.idx);
        if (!Number.isNaN(idx)) setActiveIdx(idx);
      });
    }, { threshold: 0.45 });

    const targets = [heroRef.current, ...sectionRefs.current, outroRef.current];
    targets.forEach(t => t && io.observe(t));
    return () => io.disconnect();
  }, [n]);

  // EYE BLINK: lids close, the jump happens in the dark, lids open on the new stop.
  // Same trick as desktop — transform-only, so it can't jank.
  const blinkTo = (targetScroll: number) => {
    if (blinkTlRef.current?.isActive()) return;
    if (Math.abs(targetScroll - window.scrollY) < 2) return;

    const topLid = lidTopRef.current;
    const bottomLid = lidBottomRef.current;
    if (!topLid || !bottomLid) {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
      return;
    }

    const blink = gsap.timeline();
    // y: 0 resets the CSS translateY(-101%) that GSAP would otherwise treat as pixels
    blink.fromTo(topLid, { y: 0, yPercent: -101 }, { yPercent: 0, duration: 0.26, ease: "power3.in" }, 0);
    blink.fromTo(bottomLid, { y: 0, yPercent: 101 }, { yPercent: 0, duration: 0.26, ease: "power3.in" }, 0);
    blink.add(() => {
      window.scrollTo({ top: targetScroll, behavior: "auto" });
    }, 0.3);
    blink.to(topLid, { yPercent: -101, duration: 0.5, ease: "power2.inOut" }, 0.44);
    blink.to(bottomLid, { yPercent: 101, duration: 0.5, ease: "power2.inOut" }, 0.44);
    blinkTlRef.current = blink;
  };

  useEffect(() => () => { blinkTlRef.current?.kill(); }, []);

  const scrollToPlanet = (i: number) => {
    const el = sectionRefs.current[i];
    if (el) blinkTo(el.offsetTop);
  };

  // RADIAL SWITCH: the next-stop button's circle inflates from its own position
  // until it swallows the screen, the jump happens underneath, then it dissolves.
  const radialTo = (targetScroll: number, color: string) => {
    const el = wipeRef.current;
    if (!el) {
      window.scrollTo({ top: targetScroll });
      return;
    }
    if (wipeTlRef.current?.isActive() || blinkTlRef.current?.isActive()) return;

    el.style.backgroundColor = color;
    const tl = gsap.timeline();
    tl.set(el, { display: "block", scale: 0, opacity: 1, transformOrigin: "50% 50%" });
    tl.to(el, { scale: 26, duration: 0.5, ease: "power2.in" });
    tl.add(() => { window.scrollTo({ top: targetScroll, behavior: "auto" }); });
    tl.to(el, { opacity: 0, duration: 0.5, ease: "power1.out", delay: 0.12 });
    tl.set(el, { display: "none" });
    wipeTlRef.current = tl;
  };

  useEffect(() => () => { wipeTlRef.current?.kill(); }, []);

  // hero → p1 → … → p5 → outro → back to hero
  const nextIdx = activeIdx < 0 ? 0 : activeIdx < n ? activeIdx + 1 : -1;

  const wipeColorFor = (idx: number) => {
    if (idx >= 0 && idx < n) {
      if (isDarkMode) return "#161616";
      const [h, sPct] = projects[idx].accentColor.split(" ");
      return `hsl(${h} ${sPct} 16%)`;
    }
    return isDarkMode ? "#161616" : "#0a0a14";
  };

  const goNext = () => {
    const top = nextIdx === -1
      ? 0
      : nextIdx === n
        ? outroRef.current?.offsetTop ?? 0
        : sectionRefs.current[nextIdx]?.offsetTop ?? 0;
    radialTo(top, wipeColorFor(nextIdx));
  };

  const fg = isDarkMode ? "#000000" : "#ffffff";
  const muted = isDarkMode ? "#444444" : "#cccccc";
  const faint = isDarkMode ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.6)";
  const hairline = isDarkMode ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)";

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{
        backgroundColor: isDarkMode ? "#ffffff" : "#000000",
        transition: "background-color 1.7s ease-in-out",
      }}
    >
      <Stars isInitialLoad={false} isAppLoaded={true} densityScale={0.2} sizeScale={0.6} />

      {/* Ambient gradient atmosphere: one soft wash per tour stop, tinted with
          that project's accent, crossfading as the active section changes.
          Pure opacity transitions on stacked fixed layers — nothing repaints. */}
      <div className="fixed inset-0 z-[1] pointer-events-none" aria-hidden="true">
        {[-1, ...projects.map((_, i) => i), n].map(idx => {
          let background: string;
          if (idx >= 0 && idx < n) {
            const a = projects[idx].accentColor;
            background = isDarkMode
              ? `radial-gradient(130% 90% at 20% 0%, hsl(${a} / 0.15) 0%, transparent 55%), radial-gradient(120% 100% at 85% 95%, hsl(${a} / 0.09) 0%, transparent 60%)`
              : `radial-gradient(130% 90% at 20% 0%, hsl(${a} / 0.30) 0%, transparent 55%), radial-gradient(120% 100% at 85% 95%, hsl(${a} / 0.16) 0%, transparent 60%)`;
          } else if (idx === n) {
            background = isDarkMode
              ? "radial-gradient(120% 90% at 50% 100%, rgba(0,0,0,0.10) 0%, transparent 60%)"
              : "radial-gradient(120% 90% at 50% 100%, rgba(140,140,255,0.14) 0%, transparent 60%)";
          } else {
            background = isDarkMode
              ? "radial-gradient(120% 80% at 50% 15%, rgba(0,0,0,0.07) 0%, transparent 60%)"
              : "radial-gradient(120% 80% at 50% 15%, rgba(255,170,60,0.20) 0%, transparent 60%)";
          }
          return (
            <div
              key={`atmo-${idx}`}
              className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
              style={{ opacity: activeIdx === idx ? 1 : 0, background }}
            />
          );
        })}
      </div>

      <div className="relative z-[100]">
        <DynamicNavbar viewMode={navMode} />
      </div>

      <main className="relative z-20 mob-fade-in">

        {/* ---- SUN STATION (hero) ---- */}
        <section
          ref={heroRef}
          data-idx={-1}
          className="relative min-h-[100svh] flex flex-col items-center justify-start overflow-hidden px-6 pt-24"
          aria-label="Introduction"
        >
          <div
            className="relative flex items-center justify-center"
            style={{ width: "min(62vw, 280px)", height: "min(62vw, 280px)" }}
          >
            {/* Live miniature of the system: a diagonal orbit map around the sun,
                tiny planets actually revolving — a preview of the tour below.
                SVG so the dashes stay crisp; SMIL animateMotion keeps the dots
                round and paces them along the real ellipse. */}
            <svg
              className="absolute left-1/2 top-1/2 pointer-events-none"
              style={{
                width: "calc(min(62vw, 280px) * 2.2)",
                height: "calc(min(62vw, 280px) * 2.2)",
                marginLeft: "calc(min(62vw, 280px) * -1.1)",
                marginTop: "calc(min(62vw, 280px) * -1.1)",
              }}
              viewBox="0 0 440 440"
              overflow="visible"
              aria-hidden="true"
            >
              <g transform="rotate(-16 220 220)">
                {[
                  { rx: 126, duration: 20, begin: -3, accent: projects[0]?.accentColor, reverse: false },
                  { rx: 163, duration: 34, begin: -19, accent: projects[2]?.accentColor, reverse: true },
                  { rx: 200, duration: 48, begin: -31, accent: projects[4]?.accentColor, reverse: false },
                ].map((ring, ri) => {
                  const ry = ring.rx * 0.36;
                  const sweep = ring.reverse ? 0 : 1;
                  const orbitPath = `M ${220 + ring.rx} 220 A ${ring.rx} ${ry} 0 1 ${sweep} ${220 - ring.rx} 220 A ${ring.rx} ${ry} 0 1 ${sweep} ${220 + ring.rx} 220`;
                  const dotFill = isDarkMode ? "#000000" : `hsl(${ring.accent})`;
                  return (
                    <g key={`hero-ring-${ri}`}>
                      <ellipse
                        cx="220" cy="220" rx={ring.rx} ry={ry}
                        fill="none"
                        stroke={isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)"}
                        strokeWidth="1.2"
                        strokeDasharray="2.2 9"
                      />
                      <circle r="7" fill={dotFill} opacity="0.2">
                        <animateMotion dur={`${ring.duration}s`} begin={`${ring.begin}s`} repeatCount="indefinite" path={orbitPath} />
                      </circle>
                      <circle r="3.2" fill={dotFill}>
                        <animateMotion dur={`${ring.duration}s`} begin={`${ring.begin}s`} repeatCount="indefinite" path={orbitPath} />
                      </circle>
                    </g>
                  );
                })}
              </g>
            </svg>
            {!isDarkMode ? (
              <>
                <img
                  src="/stargif.gif"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ mixBlendMode: "screen", filter: "brightness(1.5)" }}
                />
                <img
                  src="/starhd.png"
                  alt=""
                  className="absolute left-[10%] top-[10%] w-[80%] h-[80%] object-contain"
                  style={{ filter: "brightness(1.2) drop-shadow(0 0 30px rgba(255,200,50,0.6))" }}
                />
              </>
            ) : (
              <img
                src="/stardark.gif"
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
                style={{ filter: "brightness(1.1) contrast(1.1)" }}
              />
            )}

          </div>

          {/* Typographic hero — the name lives below the sun now, editorial-style */}
          <h1
            className="relative z-10 mt-4 font-serif italic text-[2.8rem] leading-[1.02] text-center"
            style={{ color: fg, transition: "color 0.5s ease" }}
          >
            Abhimanyu
          </h1>
          <p
            className="relative z-10 mt-3 font-mono text-[10px] uppercase tracking-[0.45em] text-center"
            style={{ color: faint }}
          >
            Machine Learning Engineer
          </p>

          {/* Contact tabs stuck to the walls, brand-colored; resume on the left */}
          {[
            { Icon: Github, href: "https://github.com/abhimanyudalal1", label: "GitHub", top: "21%", bg: "#6e5494" },
            { Icon: Linkedin, href: "https://linkedin.com/in/abhimanyudalal1", label: "LinkedIn", top: "31%", bg: "#0A66C2" },
            { Icon: Mail, href: "mailto:your.email@example.com", label: "Email", top: "41%", bg: "#EA4335" },
          ].map(({ Icon, href, label, top, bg }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={label}
              className="absolute right-0 z-20 flex items-center justify-center w-11 h-12 rounded-l-2xl text-white shadow-lg transition-transform active:scale-90 active:translate-x-0.5"
              style={{ top, backgroundColor: bg }}
            >
              <Icon size={19} strokeWidth={1.8} />
            </a>
          ))}
          <a
            href="/resume.pdf"
            download
            aria-label="Download resume"
            className="absolute left-0 z-20 flex items-center gap-2 rounded-r-2xl px-2.5 py-4 font-mono text-[10px] uppercase tracking-[0.3em] shadow-lg transition-transform active:scale-95"
            style={{
              top: "21%",
              writingMode: "vertical-rl",
              backgroundColor: isDarkMode ? "#111111" : "#f5f5f5",
              color: isDarkMode ? "#ffffff" : "#111111",
            }}
          >
            <Download size={14} />
            Resume
          </a>

          {/* Mission control status — what's happening right now */}
          <div
            className="relative z-10 mt-6 w-full max-w-[280px] rounded-2xl border px-4 py-3.5"
            style={{
              borderColor: hairline,
              backgroundColor: isDarkMode ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.35)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: faint }}>
                Currently
              </span>
            </div>
            <p className="mt-1.5 text-[15px] font-medium" style={{ color: fg }}>
              {HERO_STATUS.now}
            </p>
            <div
              className="mt-3 pt-3 border-t flex justify-between font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ borderColor: hairline, color: faint }}
            >
              <span className="whitespace-nowrap">0{n} missions</span>
              <span className="whitespace-nowrap">{HERO_STATUS.focus}</span>
            </div>
          </div>

          {/* Scroll hint — fades out as soon as the flight starts */}
          <div
            ref={hintRef}
            className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-500"
            style={{ color: faint }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-center">Scroll to begin the tour</p>
            <div
              className="w-[1px] h-8 animate-pulse"
              style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}
            />
          </div>
        </section>

        {/* ---- PLANET ENCOUNTERS ---- */}
        {projects.map((project, i) => {
          const accent = isDarkMode ? "#000000" : `hsl(${project.accentColor})`;
          const spriteUrl = getPlanetSprite(project.id, isDarkMode);
          const right = i % 2 === 1; // planets alternate sides along the flight path
          const size = planetSizes[i];

          return (
            <section
              key={project.id}
              ref={el => { sectionRefs.current[i] = el; }}
              data-idx={i}
              className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pl-11 pr-6 pt-16 pb-28"
              aria-label={`Project: ${project.title}`}
            >
              {/* The planet's orbit sweeps through its section */}
              <svg
                className="absolute left-[-20%] w-[140%] top-[6%] h-[42%] pointer-events-none"
                viewBox="0 0 700 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <ellipse
                  cx="350" cy="150" rx="330" ry="115"
                  fill="none"
                  stroke={isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"}
                  strokeWidth="1.5"
                  strokeDasharray="10 16"
                  opacity="0.55"
                  transform={`rotate(${right ? 9 : -9} 350 150)`}
                />
              </svg>

              <div className={`relative flex ${right ? "justify-end pr-1" : "justify-start pl-1"}`}>
                <div
                  className="mob-planet"
                  style={{ "--drift-x": right ? "56px" : "-56px" } as React.CSSProperties}
                >
                  {spriteUrl && (
                    <PlanetSprite spriteUrl={spriteUrl} size={size} />
                  )}
                </div>
              </div>

              {/* Mission log — full width, everything in thumb reach */}
              <div className="mt-8 flex flex-col gap-4" style={{ color: fg }}>
                <p
                  className="mob-reveal font-mono text-[11px] uppercase tracking-[0.35em] font-semibold"
                  style={{ color: isDarkMode ? "rgba(0,0,0,0.55)" : `hsl(${project.accentColor})` }}
                >
                  Orbit 0{i + 1} <span className="opacity-50">/ 0{n}</span>
                </p>
                <h2 className="mob-reveal mob-d1 text-3xl font-bold tracking-tight leading-tight drop-shadow-md">
                  {project.title}
                </h2>
                <p className="mob-reveal mob-d2 text-[15px] leading-relaxed font-light" style={{ color: muted }}>
                  {project.description}
                </p>

                <div className="mob-reveal mob-d2">
                  <div
                    className="flex justify-between font-mono text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: faint }}
                  >
                    <span>Mission status</span>
                    <span>{project.completionPercent}%</span>
                  </div>
                  <div
                    className="mt-1.5 h-[2px] w-full rounded-full"
                    style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${project.completionPercent}%`, backgroundColor: accent }}
                    />
                  </div>
                </div>

                <div className="mob-reveal mob-d3 flex flex-wrap gap-2">
                  {project.stack.map(tech => (
                    <span
                      key={tech}
                      className={`px-3 py-1 text-[13px] border rounded-full ${isDarkMode ? "bg-black/5 border-black/20" : "bg-white/10 border-white/20"}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mob-reveal mob-d3 mt-2 flex gap-3">
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank" rel="noopener noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-full font-medium border transition-transform active:scale-95 ${isDarkMode ? "border-black/25" : "bg-white/5 border-white/25"}`}
                    >
                      <Github size={18} /> Repository
                    </a>
                  )}
                  {project.links.live && (
                    <a
                      href={project.links.live}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-full font-medium transition-transform active:scale-95"
                      style={{
                        backgroundColor: isDarkMode ? "#000000" : `hsl(${project.accentColor})`,
                        color: isDarkMode ? "#ffffff" : "#000000",
                      }}
                    >
                      <ExternalLink size={18} /> Open
                    </a>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {/* ---- DEEP SPACE OUTRO (contact) ---- */}
        <section
          ref={outroRef}
          data-idx={n}
          className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-9 text-center"
          style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
          aria-label="Contact"
        >
          <h2 className="mob-reveal text-4xl font-bold tracking-tight drop-shadow-md" style={{ color: fg }}>
            Wanna know more<br />about me?
          </h2>
          <p className="mob-reveal mob-d1 mt-5 text-lg font-light" style={{ color: muted }}>
            Let's build something incredible.<br />Reach out across the void.
          </p>

          <div className="mob-reveal mob-d2 mt-10 flex flex-col items-center gap-6 w-full">
            <a
              href="mailto:contact@example.com"
              className="flex items-center justify-center gap-3 w-full max-w-xs min-h-[52px] rounded-full font-semibold text-lg transition-transform active:scale-95"
              style={{
                backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            >
              <Mail size={22} /> Mail Me
            </a>
            <div className="flex gap-4">
              {[Github, Linkedin, Twitter].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-transform active:scale-90 ${isDarkMode ? "bg-black/5 text-black" : "bg-white/10 text-white"}`}
                >
                  <Icon size={22} />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ---- TOUR RAIL: the flight path, docked to the left edge ---- */}
      <div
        ref={railRef}
        className="fixed left-1 top-1/2 -translate-y-1/2 z-[90] opacity-0 pointer-events-none transition-opacity duration-500"
      >
        <div className="relative" style={{ height: `${n * 48}px`, width: "32px" }}>
          <div
            className="absolute top-2 bottom-2 w-px left-1/2 -translate-x-1/2"
            style={{ backgroundColor: hairline }}
          />
          <div
            ref={fillRef}
            className="absolute top-2 w-px left-1/2 -translate-x-1/2"
            style={{
              height: "0%",
              maxHeight: "calc(100% - 1rem)",
              backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)",
            }}
          />
          <div className="relative h-full flex flex-col justify-between items-center">
            {projects.map((project, i) => (
              <button
                key={`rail-${project.id}`}
                onClick={() => scrollToPlanet(i)}
                className="relative flex items-center justify-center w-8 h-10 border-0 outline-none bg-transparent"
                aria-label={`Fly to ${project.title}`}
                aria-current={activeIdx === i ? "true" : undefined}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${activeIdx === i ? "opacity-100 scale-[1.8]" : "opacity-40 scale-100"}`}
                  style={{ backgroundColor: isDarkMode ? "#000000" : `hsl(${project.accentColor})` }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Return to orbit — blink back to the sun ---- */}
      <div
        ref={pillRef}
        className="fixed inset-x-0 z-[90] flex justify-center opacity-0 pointer-events-none transition-opacity duration-500"
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <button
          onClick={() => blinkTo(0)}
          className="font-mono text-[10px] uppercase tracking-[0.3em] px-5 py-3 rounded-full border active:scale-95 transition-transform"
          style={{
            color: isDarkMode ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.85)",
            borderColor: isDarkMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
            backgroundColor: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)",
          }}
        >
          ↩ Return to orbit
        </button>
      </div>

      {/* ---- Now-playing disc: tap to open the player drawer.
           The Spotify iframe only ever loads if the drawer is opened. ---- */}
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <button
            className="fixed z-[95] w-12 h-12 rounded-full shadow-lg"
            style={{
              left: "1rem",
              bottom: "calc(1rem + env(safe-area-inset-bottom))",
              border: `1px solid ${isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.25)"}`,
            }}
            aria-label="Now playing — open music player"
          >
            <span
              className="mob-disc-spin flex items-center justify-center w-full h-full rounded-full"
              style={{
                background: "repeating-radial-gradient(circle at 50% 50%, #141414 0px 2px, #262626 2px 4px)",
                color: "#ffffff",
              }}
            >
              <Music size={16} />
            </span>
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[190] bg-black/50" />
          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-[195] rounded-t-2xl px-4 pt-3"
            style={{
              backgroundColor: isDarkMode ? "#ffffff" : "#161616",
              paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))",
            }}
          >
            <div
              className="mx-auto mb-4 h-1 w-10 rounded-full"
              style={{ backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.25)" }}
            />
            <Drawer.Title
              className="mb-3 font-mono text-[10px] font-normal uppercase tracking-[0.3em]"
              style={{ color: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)" }}
            >
              Soundtrack of the tour
            </Drawer.Title>
            <iframe
              title="Spotify player"
              style={{ borderRadius: "12px" }}
              src="https://open.spotify.com/embed/track/6pWgRkpqVfxnj3WuIcJ7WP?utm_source=generator&theme=0"
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media;"
              loading="lazy"
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ---- Next-stop planet button: the upcoming world sits in the circle;
           tapping it swallows the screen in a radial wipe and lands there ---- */}
      <button
        onClick={goNext}
        aria-label={
          nextIdx === -1 ? "Back to the top"
            : nextIdx === n ? "Go to contact"
              : `Next project: ${projects[nextIdx].title}`
        }
        className="fixed z-[95] w-16 h-16 rounded-full border flex items-center justify-center shadow-xl transition-transform active:scale-90"
        style={{
          right: "1rem",
          bottom: "calc(1rem + env(safe-area-inset-bottom))",
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.9)" : "rgba(12,12,12,0.65)",
          borderColor: isDarkMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
          color: isDarkMode ? "#000000" : "#ffffff",
        }}
      >
        {nextIdx >= 0 && nextIdx < n ? (
          <span
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              display: "block",
              backgroundImage: `url('${getPlanetSprite(projects[nextIdx].id, isDarkMode)}')`,
              backgroundSize: `${40 * SPRITE_COLS}px ${40 * 3}px`,
              backgroundPosition: "0px 0px",
            }}
          />
        ) : nextIdx === n ? (
          <Mail size={22} />
        ) : (
          <ArrowUp size={22} />
        )}
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full font-mono text-[9px] font-bold"
          style={{
            backgroundColor: isDarkMode ? "#000000" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000",
          }}
        >
          {nextIdx >= 0 && nextIdx < n ? nextIdx + 1 : nextIdx === n ? "@" : "↑"}
        </span>
      </button>

      {/* Radial wipe circle, anchored on the next-stop button's center */}
      <div
        ref={wipeRef}
        className="fixed z-[210] w-24 h-24 rounded-full pointer-events-none"
        style={{
          display: "none",
          right: "calc(1rem - 16px)",
          bottom: "calc(1rem + env(safe-area-inset-bottom) - 16px)",
        }}
      />

      {/* ---- Eye-blink lids (transform-only, never interactive) ---- */}
      <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
        <div
          ref={lidTopRef}
          className="absolute left-[-5%] right-[-5%] top-0"
          style={{
            height: "62%",
            backgroundColor: "#000000",
            borderRadius: "0 0 50% 50% / 0 0 10vh 10vh",
            transform: "translateY(-101%)",
          }}
        />
        <div
          ref={lidBottomRef}
          className="absolute left-[-5%] right-[-5%] bottom-0"
          style={{
            height: "62%",
            backgroundColor: "#000000",
            borderRadius: "50% 50% 0 0 / 10vh 10vh 0 0",
            transform: "translateY(101%)",
          }}
        />
      </div>
    </div>
  );
};

export default MobileIndex;
