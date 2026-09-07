import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Hero from "@/components/Hero";
import SolarSystem3D, { makeCameraState, type CameraState } from "@/components/SolarSystem3D";
import MeteorCursor from "@/components/MeteorCursor";
import Stars from "@/components/Stars";
import { DynamicNavbar, NavbarViewMode } from "@/components/DynamicNavbar";
import { CosmicLoading } from "@/components/CosmicLoading";
import { toLegacyProjects } from "@/data/projects";
import { stops, flybys, getLedTo, formatRange, yearOf } from "@/data/milestones";
import { PLANET_SHEETS } from "@/lib/planet-sprites";
import { dockPose, departurePose, revealPose } from "@/lib/scene-3d";
import { ExternalLink, Github, Mail, Linkedin, Twitter } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWindowSize } from "@/hooks/use-window-size";
import { useMobileExperience } from "@/hooks/use-mobile";
import MobileIndex from "@/pages/MobileIndex";

gsap.registerPlugin(ScrollTrigger);

// ---- Grand Tour timing constants (GSAP time units, mapped onto scroll via scrub) ----
const TOUR_START = 1; // time when the camera departs for the first planet
const TOUR_PER_PLANET = 4; // time budget per planet (travel + hold + exit)
const TOUR_FOCUS_OFFSET = 2.2; // visual center of a planet's hold inside its slot
const NAV_HANDOFF_SCROLL_PX = 260; // scroll depth at which the default navbar hands off to the projects-mode navbar (and back, on the way up)

// Clear the session storage flag ONLY if this is a hard browser reload.
// This code runs exactly once per hard page load (not during client-side routing).
if (typeof performance !== 'undefined') {
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === "reload") {
    sessionStorage.removeItem("hasPlayedIntro");
  }
}

const DesktopIndex = () => {
  const [navMode, setNavMode] = useState<NavbarViewMode>('default');
  const { isDarkMode } = useTheme();
  const dimensions = useWindowSize();

  // Check if initial load has happened in this session
  const hasLoadedBefore = useMemo(() => {
    return sessionStorage.getItem('hasPlayedIntro') === 'true';
  }, []);

  // Loading States
  const [isCosmicLoadingComplete, setIsCosmicLoadingComplete] = useState(hasLoadedBefore);
  // The 2D starfield sits behind the opaque intro, so its render loop stays parked until
  // the intro begins fading out — no point burning frames on pixels nobody can see.
  const [starsActive, setStarsActive] = useState(hasLoadedBefore);
  // The scroll tour can only be built once the intro sweep has landed the scene at rest,
  // because it measures the real on-screen planet positions.
  const [sceneReady, setSceneReady] = useState(false);

  // Snapshot of the theme when the page mounted, for the one-shot preloader below.
  const isDarkModeAtMount = useRef(isDarkMode);

  // Preload heavy assets.
  // Nothing here sets React state: decoding several MB of spritesheets while the intro is
  // running used to re-render the page mid-sweep, and the completion flag was unused anyway.
  // Scene-critical sprites are fetched right away; off-route images wait for idle time so
  // their download and decode never compete with the intro.
  useEffect(() => {
    // Only the current theme's spritesheets are needed to draw the scene; the other
    // theme's set is another ~4MB that used to be pulled down in parallel with the intro.
    const sheets = Object.values(PLANET_SHEETS);
    const lightSprites = sheets.map(s => s.light);
    const darkSprites = sheets.map(s => s.dark);

    const sceneImages = [
      '/stargif.gif',
      '/starhd.png',
      '/Star%20-%20188959248%20-%20spritesheet.png',
      ...(isDarkModeAtMount.current ? darkSprites : lightSprites),
    ];

    const deferredImages = [
      // The other theme, ready for a toggle
      ...(isDarkModeAtMount.current ? lightSprites : darkSprites),
      // About page images
      '/me.webp',
      '/me_dark.webp',
      // Blogs page images (webp versions are much smaller)
      '/domedark.webp',
      '/domelight.webp',
    ];

    const preload = (src: string) => {
      const img = new Image();
      // Hand the decode to a background thread so it can't stall an animation frame.
      img.decoding = 'async';
      img.src = src;
    };

    sceneImages.forEach(preload);

    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;
    const loadDeferred = () => deferredImages.forEach(preload);

    if (idle) {
      idleHandle = idle(loadDeferred, { timeout: 10000 });
    } else {
      timeoutHandle = window.setTimeout(loadDeferred, 8000);
    }

    return () => {
      const cancelIdle = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (idleHandle !== undefined && cancelIdle) cancelIdle(idleHandle);
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    };
  }, []);

  // Projects Data
  const projectsData = toLegacyProjects();

  const containerRef = useRef<HTMLDivElement>(null);
  const initialSweepRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const domWrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const solarSystemRef = useRef<HTMLDivElement>(null);
  const sceneWrapperRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const focusScrimRef = useRef<HTMLDivElement>(null);

  // Project focus cards + sidebar nodes + orbiting link satellites
  const focusCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sidebarNodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const orbitRingRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Camera pose for the 3D flight. A plain mutable object rather than state: GSAP
  // tweens its numbers straight from the scrubbed timeline and the scene's render
  // loop reads it each frame, so the entire flight runs without a single re-render.
  const cameraStateRef = useRef<CameraState>(
    makeCameraState(typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1.6)
  );
  // Revealed fraction of the travelled path, read by the scene the same way.
  // GSAP tweens the ref object's own `current` property directly.
  const trailProgressRef = useRef(0);

  // Screen-space labels raised by each flyby as it is passed
  const flybyLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Year readout at the rail head, written imperatively from onUpdate
  const yearRef = useRef<HTMLSpanElement>(null);
  // Live warp level handed to the starfield. A ref rather than state because it is
  // rewritten on every scroll frame — see StarsProps.warpSource.
  const warpRef = useRef(0);

  // Navigation State storage for GSAP progress
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Eye-blink transition: vignette on planet hover, lids close over the jump
  const vignetteRef = useRef<HTMLDivElement>(null);
  const lidTopRef = useRef<HTMLDivElement>(null);
  const lidBottomRef = useRef<HTMLDivElement>(null);
  const blinkTlRef = useRef<gsap.core.Timeline | null>(null);

  // Synchronize DOM elements sweep with 3D starfield sweep without triggering React state re-renders mid-animation
  useEffect(() => {
    if (!hasLoadedBefore) {
      // 1. Initial Wrapper Opacity
      if (domWrapperRef.current) {
        gsap.set(domWrapperRef.current, { opacity: 0, pointerEvents: 'none' });
        gsap.to(domWrapperRef.current, {
          opacity: 1,
          duration: 1.5,
          delay: 1,
          onComplete: () => {
            if (domWrapperRef.current) {
              domWrapperRef.current.style.pointerEvents = 'auto';
            }
          }
        });
      }

      // 2. Animate the planets sweep
      if (initialSweepRef.current) {
        gsap.fromTo(initialSweepRef.current,
          {
            x: '-40vw',
            y: '40vh',
            rotation: -15
            // Removed scale to prevent "zoomed out" feeling
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 5,
            delay: 1,
            ease: 'power3.out',
            onComplete: () => setSceneReady(true)
          }
        );
      } else {
        setSceneReady(true);
      }

      // 3. Navbar fade in.
      // NOTE: the navbar wrapper holds a position:fixed child (DynamicNavbar). Any
      // lingering transform here would become the fixed child's containing block and
      // make it scroll away with the page — so we clear the transform once the slide-in
      // settles, leaving the navbar truly pinned to the viewport.
      if (navbarRef.current) {
        gsap.fromTo(navbarRef.current,
          { opacity: 0, y: -20 },
          {
            opacity: 1, y: 0, duration: 1.5, delay: 4.5, ease: 'power2.out',
            onComplete: () => gsap.set(navbarRef.current, { clearProps: 'transform' })
          }
        );
      }
    } else if (hasLoadedBefore) {
      if (domWrapperRef.current) {
        gsap.set(domWrapperRef.current, { opacity: 1, pointerEvents: 'auto' });
      }
      if (navbarRef.current) {
        // opacity only — no transform, so the fixed navbar stays pinned to the viewport
        gsap.set(navbarRef.current, { opacity: 1, clearProps: 'transform' });
      }
      setSceneReady(true);
    }
  }, [hasLoadedBefore]);

  // ---- THE GRAND TOUR ----
  // One pinned, scrubbed timeline that flies the camera (the scene wrapper) across the
  // real solar system: each scroll segment centers and magnifies the next project planet
  // in place, lights up its orbit, and reveals a mission-log card beside it. After the
  // last planet the camera pulls back out and the system dims into the contact outro.
  useEffect(() => {
    if (!sceneReady || !containerRef.current || !sceneWrapperRef.current) return;
    if (dimensions.width === 0) return;

    const container = containerRef.current;

    const ctx = gsap.context(() => {
      const cRect = container.getBoundingClientRect();
      const cw = cRect.width;
      const ch = cRect.height;
      const aspect = cw / Math.max(1, ch);

      // Camera poses are analytic now. The 2D tour had to measure live planet rects
      // and solve `p*s + t` to place each one at the focus point, because the scene
      // was a CSS-transformed plane. In a real 3D scene the layout is known up front
      // (lib/scene-3d) and the camera simply goes where it belongs — no measurement,
      // nothing to race against layout.
      const poses = stops.map((_, i) => dockPose(i, aspect));
      const departure = departurePose(aspect);
      const reveal = revealPose(aspect);

      const tourEnd = TOUR_START + poses.length * TOUR_PER_PLANET;
      const totalScroll = 1000 + projectsData.length * 1300 + 1500;


      // Fade the scroll hint in once the tour is armed (one-shot, not scrubbed).
      // Guarded on actually being at the top: this effect re-runs whenever the
      // debounced window size settles, and unguarded it would raise the hint again
      // over whatever the reader had already scrolled to — including the final
      // pull-back reveal, where it read as "scroll to begin" over the outro.
      if (hintRef.current && window.scrollY < 10) {
        gsap.to(hintRef.current, { opacity: 1, duration: 0.8, delay: 0.2 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: `+=${totalScroll}`,
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            // Derive time from scroll progress (tl.time() lags behind the scrub)
            const t = self.progress * tl.duration();

            // Navbar hands off to the projects-mode navbar the moment the default
            // navbar has scrolled away (past its own height), and hands back the moment
            // we scroll back up above that same line — symmetric in both directions.
            const mode: NavbarViewMode = (self.scroll() - self.start) > NAV_HANDOFF_SCROLL_PX ? 'projects' : 'default';
            setNavMode(prev => (prev === mode ? prev : mode));

            // Which planet is currently held in focus?
            let currentIdx = -1;
            poses.forEach((_, i) => {
              const center = TOUR_START + i * TOUR_PER_PLANET + TOUR_FOCUS_OFFSET;
              if (t >= center - TOUR_PER_PLANET / 2 && t <= center + TOUR_PER_PLANET / 2) {
                currentIdx = i;
              }
            });

            // Update rail DOM nodes directly for maximum performance
            sidebarNodeRefs.current.forEach((btn, i) => {
              if (!btn) return;
              const dot = btn.querySelector('.node-dot');
              if (i === currentIdx) {
                dot?.classList.remove('opacity-40', 'scale-100');
                dot?.classList.add('opacity-100', 'scale-[1.8]');
              } else {
                dot?.classList.add('opacity-40', 'scale-100');
                dot?.classList.remove('opacity-100', 'scale-[1.8]');
              }
            });

            // Warp: peaks mid-leg and falls to zero as the camera settles on a planet.
            // The camera tween runs for the first 1.8 of each 4-unit slot, so warp is
            // shaped over that window and held at zero for the dwell that follows.
            {
              const legPos = (t - TOUR_START) / TOUR_PER_PLANET;
              const withinLeg = legPos - Math.floor(legPos);
              const travelFraction = 1.8 / TOUR_PER_PLANET;
              let w = 0;
              if (t > TOUR_START && t < tourEnd && withinLeg < travelFraction) {
                // Half-sine over the travel window: still at both ends, fastest between
                w = Math.sin((withinLeg / travelFraction) * Math.PI);
              }
              warpRef.current = w;
            }

            // Year readout. Between two stops it shows the crossing (2023 ▸ 2024) so
            // the transit reads as time passing rather than as dead scroll.
            if (yearRef.current) {
              const legRaw = (t - TOUR_START) / TOUR_PER_PLANET;
              const leg = Math.max(0, Math.min(poses.length - 1, legRaw));
              const from = stops[Math.floor(leg)];
              const to = stops[Math.min(stops.length - 1, Math.floor(leg) + 1)];
              let label = '';
              if (from) {
                const travelling = currentIdx === -1 && to && yearOf(to) !== yearOf(from);
                label = travelling ? `${yearOf(from)} ▸ ${yearOf(to)}` : yearOf(from);
              }
              if (yearRef.current.textContent !== label) yearRef.current.textContent = label;
            }

            // Sidebar, return button and scrim hit-area are only live while touring
            const inTour = t >= TOUR_START + 1.2 && t <= tourEnd + 0.3;
            const sidebarParent = document.getElementById('project-sidebar');
            if (sidebarParent) {
              sidebarParent.style.opacity = inTour ? '1' : '0';
              sidebarParent.style.pointerEvents = inTour ? 'auto' : 'none';
            }
            const returnBtn = document.getElementById('tour-return');
            if (returnBtn) {
              returnBtn.style.opacity = inTour ? '1' : '0';
              returnBtn.style.pointerEvents = inTour ? 'auto' : 'none';
            }
            if (yearRef.current) yearRef.current.style.opacity = inTour ? '1' : '0';
            if (focusScrimRef.current) {
              // While touring, the dimmed space becomes a click target to zoom back out
              focusScrimRef.current.style.pointerEvents = inTour ? 'auto' : 'none';
            }

            // Vertical track "progress filler" line, first focus → last focus
            const fillLine = document.getElementById('project-sidebar-fill');
            if (fillLine) {
              const startT = TOUR_START + TOUR_FOCUS_OFFSET;
              const endT = TOUR_START + (poses.length - 1) * TOUR_PER_PLANET + TOUR_FOCUS_OFFSET;
              let fillPercent = 0;
              if (t <= startT) fillPercent = 0;
              else if (t >= endT) fillPercent = 100;
              else fillPercent = ((t - startT) / (endT - startT)) * 100;

              fillLine.style.height = `${fillPercent}%`;
            }
          }
        }
      });

      // ---- Departure -------------------------------------------------------
      if (hintRef.current) {
        // immediateRender off + explicit from, so reversing to the top restores the hint
        tl.fromTo(hintRef.current,
          { opacity: 1, y: 0 },
          { opacity: 0, y: 16, duration: 0.5, immediateRender: false },
          0);
      }
      // The identity overlay belongs to the establishing shot only; once the flight
      // starts the frame is the milestone cards'.
      if (heroRef.current) {
        tl.fromTo(heroRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.8, ease: 'power2.in', immediateRender: false },
          0.2);
      }

      // Depth-of-field scrim: dims and blurs everything outside the porthole the
      // held planet flies into, so the card stays readable over a moving starfield.
      if (focusScrimRef.current) {
        tl.fromTo(focusScrimRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: "power1.inOut" },
          TOUR_START + 0.8);
        tl.to(focusScrimRef.current,
          { opacity: 0, duration: 1.2, ease: "power1.inOut" },
          TOUR_START + poses.length * TOUR_PER_PLANET - 0.6);
      }

      // ---- The flight ------------------------------------------------------
      // GSAP tweens the plain camera-state object; the render loop reads it every
      // frame and moves the actual PerspectiveCamera. Nothing here touches React or
      // the DOM, so scrubbing the whole flight costs no re-renders.
      const cam = cameraStateRef.current;
      gsap.set(cam, {
        px: departure.pos.x, py: departure.pos.y, pz: departure.pos.z,
        ax: departure.aim.x, ay: departure.aim.y, az: departure.aim.z,
      });

      const flyTo = (pose: typeof departure, at: number, duration: number, ease: string) => {
        tl.to(cam, {
          px: pose.pos.x, py: pose.pos.y, pz: pose.pos.z,
          duration, ease, immediateRender: false,
        }, at);
        // The aim leads the move slightly and settles sooner than the position, so
        // the camera swings onto the next planet while still closing on it rather
        // than rotating after it has already arrived.
        tl.to(cam, {
          ax: pose.aim.x, ay: pose.aim.y, az: pose.aim.z,
          duration: duration * 0.75, ease: 'power2.out', immediateRender: false,
        }, at);
      };

      poses.forEach((pose, i) => {
        const t = TOUR_START + i * TOUR_PER_PLANET;

        // Accelerate away from the last milestone, decelerate onto the next.
        flyTo(pose, t, 1.8, 'power2.inOut');

        // The path draws itself in behind the camera as it covers each leg
        tl.to(trailProgressRef, {
          current: poses.length > 1 ? i / (poses.length - 1) : 1,
          duration: 1.8, ease: 'power2.inOut', immediateRender: false,
        }, t);

        // Mission-log card drifts in on the open right side
        const card = focusCardRefs.current[i];
        if (card) {
          tl.fromTo(card,
            { opacity: 0, x: 80, filter: 'blur(8px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.7, ease: "power2.out" },
            t + 1.1);
          tl.set(card, { pointerEvents: 'auto' }, t + 1.1);
          tl.to(card,
            { opacity: 0, x: -60, filter: 'blur(6px)', duration: 0.6, ease: "power2.in" },
            t + 3.3);
          tl.set(card, { pointerEvents: 'none' }, t + 3.9);
        }

        // Orbiting quick-link satellites materialize around the held planet
        const ring = orbitRingRefs.current[i];
        if (ring) {
          tl.fromTo(ring,
            { opacity: 0, scale: 0.85 },
            { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
            t + 1.2);
          tl.set(ring, { pointerEvents: 'auto' }, t + 1.2);
          tl.to(ring, { opacity: 0, scale: 0.9, duration: 0.5, ease: "power2.in" }, t + 3.3);
          tl.set(ring, { pointerEvents: 'none' }, t + 3.8);
        }
      });

      // ---- Flybys ----------------------------------------------------------
      // Minor milestones passed mid-transit. Label only — a flyby is something you
      // go past, so it gets no camera stop of its own.
      const flybyTime = (f: typeof flybys[number]) =>
        Math.max(
          TOUR_START + 0.9,
          TOUR_START + (f.afterStop + f.slot) * TOUR_PER_PLANET + TOUR_FOCUS_OFFSET
        );

      flybys.forEach((flyby, fi) => {
        const label = flybyLabelRefs.current[fi];
        if (!label) return;
        const at = flybyTime(flyby);
        tl.fromTo(label,
          { opacity: 0, y: 14, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' },
          at - 0.6);
        tl.to(label, { opacity: 0, y: -14, filter: 'blur(6px)', duration: 0.5, ease: 'power2.in' }, at + 0.7);
      });


      // ---- The reveal ------------------------------------------------------
      // The camera climbs away from the last milestone and looks back down over the
      // whole system, so the entire travelled path is legible in one frame. This is
      // the payoff the outro lands on top of.
      flyTo(reveal, tourEnd, 2.4, 'power2.inOut');
      tl.to(trailProgressRef, { current: 1, duration: 1.2, ease: 'power1.out', immediateRender: false }, tourEnd);

      // ...then the scene recedes while the contact outro surfaces over it
      tl.to(solarSystemRef.current, { opacity: 0.28, filter: 'blur(3px)', duration: 1.4, ease: "power1.inOut" }, tourEnd + 1.4);
      tl.fromTo(outroRef.current,
        { opacity: 0, scale: 0.92, y: 60 },
        { opacity: 1, scale: 1, y: 0, duration: 1.6, ease: "power3.out" },
        tourEnd + 1.2
      );
      tl.set(outroRef.current, { pointerEvents: 'auto' }, tourEnd + 1.8);

      // Small tail so the outro holds on screen before the pin releases
      tl.to({}, { duration: 0.8 }, tourEnd + 2.8);

      timelineRef.current = tl;
    }, container);

    return () => {
      timelineRef.current = null;
      ctx.revert();
    };
  }, [sceneReady, projectsData.length, dimensions]);

  // The 3D scene has built itself and drawn a frame. The intro sweep also arms the
  // tour; whichever lands first wins, and the later one is a harmless no-op set.
  const handleSceneReady = () => setSceneReady(true);

  // Corners of the screen darken while the cursor rests on a planet — a quiet
  // "focusing" cue. Driven straight through the ref (CSS handles the fade), so
  // hovering never re-renders the scene.
  const handlePlanetHover = (hovering: boolean) => {
    if (vignetteRef.current) vignetteRef.current.style.opacity = hovering ? '1' : '0';
  };

  // EYE BLINK: two curved lids close over the screen; while it's fully covered the
  // scroll + scrubbed timeline snap straight to the destination (any jank happens in
  // the dark), then the lids open on the planet already in focus. The lids are the
  // only thing animated — the scene itself is never touched, so nothing can wedge.
  const blinkTo = (targetScroll: number) => {
    const tl = timelineRef.current;
    const st = tl?.scrollTrigger;
    if (!tl || !st) return;
    if (blinkTlRef.current?.isActive()) return; // one blink at a time
    if (Math.abs(targetScroll - window.scrollY) < 2) return;

    const topLid = lidTopRef.current;
    const bottomLid = lidBottomRef.current;
    if (!topLid || !bottomLid) {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      return;
    }

    handlePlanetHover(false); // release the hover vignette before the blink

    const blink = gsap.timeline();

    // Close (lids always start from fully open — fromTo keeps every run deterministic).
    // y: 0 matters: the lids' resting position comes from a CSS translateY(-101%),
    // which GSAP parses as a *pixel* y offset — without resetting it the lids animate
    // entirely off-screen and the blink is invisible.
    blink.fromTo(topLid, { y: 0, yPercent: -101 }, { yPercent: 0, duration: 0.28, ease: 'power3.in' }, 0);
    blink.fromTo(bottomLid, { y: 0, yPercent: 101 }, { yPercent: 0, duration: 0.28, ease: 'power3.in' }, 0);

    // Jump while the screen is fully covered
    blink.add(() => {
      // The page sets `html { scroll-behavior: smooth }`. Chrome applies that to
      // programmatic scrolls too, so it would *animate* to the target over a long,
      // distance-dependent glide — the lids would reopen mid-flight with the camera
      // still travelling. Pin it to instant for the jump, then restore.
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';

      window.scrollTo({ top: targetScroll, behavior: 'instant' as ScrollBehavior });
      ScrollTrigger.update();
      st.getTween()?.progress(1); // scrub completes instantly, in the dark

      // Hard guarantee: render the timeline at the exact destination state right now.
      // If the scrub tween wasn't catchable above, it would otherwise keep easing for
      // ~1s and the camera flight would still be visible when the lids open.
      const p = gsap.utils.clamp(0, 1, (targetScroll - st.start) / (st.end - st.start));
      tl.totalProgress(p);

      html.style.scrollBehavior = prevBehavior;
    }, 0.3);

    // Open on the new view
    blink.to(topLid, { yPercent: -101, duration: 0.55, ease: 'power2.inOut' }, 0.42);
    blink.to(bottomLid, { yPercent: 101, duration: 0.55, ease: 'power2.inOut' }, 0.42);

    blinkTlRef.current = blink;
  };

  useEffect(() => () => { blinkTlRef.current?.kill(); }, []);

  // Fly the camera to planet `index`'s hold point — used by the rail nodes AND by
  // clicking a planet directly (same zoom as scrolling there, because it IS scrolling there)
  const scrollToPlanet = (index: number) => {
    const tl = timelineRef.current;
    const st = tl?.scrollTrigger;
    if (!tl || !st) return;

    const targetTime = TOUR_START + index * TOUR_PER_PLANET + TOUR_FOCUS_OFFSET;
    const targetScroll = st.start + (targetTime / tl.duration()) * (st.end - st.start);

    blinkTo(targetScroll);
  };

  // Zoom back out to the full system (top of the tour)
  const scrollToTop = () => {
    blinkTo(0);
  };

  // Escape always returns to the zoomed-out system
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && window.scrollY > 10) scrollToTop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Clicking the dimmed space around the porthole zooms back out;
  // clicks near the focused planet itself are ignored.
  const handleScrimClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const holeX = rect.left + rect.width * 0.32;
    const holeY = rect.top + rect.height * 0.46;
    const dist = Math.hypot(e.clientX - holeX, e.clientY - holeY);
    if (dist > rect.height * 0.26) scrollToTop();
  };

  return (
    <div className="min-h-screen font-sans" style={{
      backgroundColor: isDarkMode ? '#ffffff' : '#000000',
      transition: 'background-color 1.7s ease-in-out'
    }}>
      {!isCosmicLoadingComplete && !hasLoadedBefore && (
        <CosmicLoading
          onFadeStart={() => setStarsActive(true)}
          onComplete={() => {
            setIsCosmicLoadingComplete(true);
            sessionStorage.setItem('hasPlayedIntro', 'true'); // Mark as played for client-side navigation
          }}
        />
      )}

      <Stars
        isInitialLoad={false}
        isAppLoaded={true}
        active={starsActive || isCosmicLoadingComplete}
        warpSource={warpRef}
      />

      <div ref={domWrapperRef}>
        {/* Navigation Bar - Stays on top */}
        <div ref={navbarRef} className="relative z-[100]" style={{ opacity: hasLoadedBefore ? 1 : 0 }}>
          <DynamicNavbar viewMode={navMode} />
        </div>

      <div ref={containerRef} className="relative z-20 h-screen w-full overflow-hidden bg-transparent">

          {/* Tour Navigation Rail — thin hairline, small dots, active label */}
          <div
            id="project-sidebar"
            className="fixed right-5 md:right-9 top-1/2 -translate-y-1/2 z-[100] opacity-0 transition-opacity duration-500 pointer-events-none"
            style={{ height: `${projectsData.length * 56}px` }}
          >
            {/* Hairline track */}
            <div className="absolute top-1 bottom-1 w-px left-1/2 -translate-x-1/2"
                 style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }} />

            {/* Progress fill */}
            <div id="project-sidebar-fill"
                 className="absolute top-1 w-px left-1/2 -translate-x-1/2"
                 style={{
                   height: '0%',
                   backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)'
                 }} />

            {/* Nodes */}
            <div className="relative h-full flex flex-col justify-between items-center">
               {projectsData.map((project, i) => {
                 const isRole = stops[i]?.kind === 'role';
                 return (
                 <button
                   key={`sidebar-node-${project.id}`}
                   ref={el => { if (sidebarNodeRefs.current) sidebarNodeRefs.current[i] = el; }}
                   onClick={() => scrollToPlanet(i)}
                   className="group relative flex items-center justify-center w-5 h-5 border-0 outline-none bg-transparent"
                   aria-label={`Scroll to ${project.title}`}
                 >
                    <span
                      className="node-label absolute right-6 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] opacity-0 translate-x-1 transition-all duration-500 group-hover:opacity-60 group-hover:translate-x-0"
                      style={{ color: isDarkMode ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)' }}
                    >
                      {stops[i] ? yearOf(stops[i]) : `0${i + 1}`} · {project.title}
                    </span>
                    {/* Roles are diamonds, builds are dots — the rail has to show the
                        path is two kinds of thing without needing a legend. */}
                    <span
                      className="node-dot w-2 h-2 opacity-40 scale-100 transition-all duration-500"
                      style={{
                        backgroundColor: isDarkMode ? '#000000' : `hsl(${project.accentColor})`,
                        borderRadius: isRole ? '1px' : '9999px',
                        transform: isRole ? 'rotate(45deg)' : undefined,
                      }}
                    />
                 </button>
                 );
               })}
            </div>

            {/* Year readout — makes "further out" legible as time rather than leaving
                it as a metaphor the viewer has to infer. Written from onUpdate. */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span
                ref={yearRef}
                className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-0 transition-opacity duration-500"
                style={{ color: isDarkMode ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)' }}
              />
            </div>
          </div>
          {/* The scene. The camera lives inside the 3D canvas now, so this wrapper no
              longer transforms anything — the flight is real camera movement, not a
              panned and scaled plane. initialSweepRef is kept for the intro sweep. */}
          <div ref={initialSweepRef} className="absolute inset-0 w-full h-full origin-center">
            <div ref={sceneWrapperRef} className="absolute inset-0 w-full h-full">

              {/* Mounted here rather than inside the renderer: it used to live in the
                  SVG solar system, which the 3D swap retired. It is fixed-position
                  and renderer-agnostic, so the scene is the wrong owner for it. */}
              <MeteorCursor />

              <div ref={solarSystemRef} className="absolute inset-0 z-30">
                <SolarSystem3D
                  cameraState={cameraStateRef}
                  trailProgress={trailProgressRef}
                  onPlanetClick={scrollToPlanet}
                  onPlanetHover={handlePlanetHover}
                  onReady={handleSceneReady}
                />
              </div>

              {/* Identity, in the DOM above the canvas rather than as text in the
                  scene — see Hero. Fades out the moment the flight departs. */}
              <div ref={heroRef} className="absolute inset-0 z-40 pointer-events-none">
                <Hero />
              </div>
            </div>
          </div>


          {/* Depth-of-field scrim: blurs & dims the scene except the porthole at the
              focus point, keeping the held planet crisp and the card text readable */}
          <div
            ref={focusScrimRef}
            onClick={handleScrimClick}
            className="absolute inset-0 z-[35] pointer-events-none opacity-0"
            style={{
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
              maskImage: 'radial-gradient(circle 42vh at 32% 46%, transparent 55%, black 100%)',
              WebkitMaskImage: 'radial-gradient(circle 42vh at 32% 46%, transparent 55%, black 100%)',
            }}
          />

          {/* Focus vignette: the corners darken softly while a planet is hovered.
              farthest-corner circle → 100% lands exactly on the screen corners */}
          <div
            ref={vignetteRef}
            className="fixed inset-0 z-[150] pointer-events-none"
            style={{
              opacity: 0,
              transition: 'opacity 0.45s ease',
              background: 'radial-gradient(circle at 50% 50%, transparent 48%, rgba(0,0,0,0.25) 76%, rgba(0,0,0,0.65) 100%)',
            }}
          />

          {/* Eye-blink lids: curved panels that close over the planet jump and open
              on the new view. Transform-only animation, never interactive. */}
          <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
            <div
              ref={lidTopRef}
              className="absolute left-[-5%] right-[-5%] top-0"
              style={{
                height: '62%',
                backgroundColor: '#000000',
                borderRadius: '0 0 50% 50% / 0 0 14vh 14vh',
                transform: 'translateY(-101%)',
              }}
            />
            <div
              ref={lidBottomRef}
              className="absolute left-[-5%] right-[-5%] bottom-0"
              style={{
                height: '62%',
                backgroundColor: '#000000',
                borderRadius: '50% 50% 0 0 / 14vh 14vh 0 0',
                transform: 'translateY(101%)',
              }}
            />
          </div>

          {/* Scroll hint */}
          <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center pointer-events-none">
            <div
              ref={hintRef}
              className="flex flex-col items-center gap-2 opacity-0"
              style={{ color: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.4em]">Scroll to begin the tour</p>
              <div
                className="w-[1px] h-8 animate-pulse"
                style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }}
              />
            </div>
          </div>

          {/* Mission-log focus cards, one per planet, on the open right side.
              Mono in dark mode; accent-tinted in light mode. */}
          <div className="absolute inset-0 z-40 pointer-events-none">
            {projectsData.map((project, index) => (
              <div
                key={`focus-card-${project.id}`}
                className="absolute inset-y-0 right-[6%] flex items-center justify-end pointer-events-none"
                style={{ width: '44%' }}
              >
                <div
                  ref={(el) => focusCardRefs.current[index] = el}
                  className="flex flex-col gap-5 max-w-xl items-start opacity-0 pointer-events-none"
                  style={{ color: isDarkMode ? '#000000' : '#ffffff' }}
                >
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <p
                      className="font-mono text-xs md:text-sm uppercase tracking-[0.35em] font-semibold"
                      style={{ color: isDarkMode ? 'rgba(0,0,0,0.55)' : `hsl(${project.accentColor})` }}
                    >
                      Milestone 0{index + 1} <span className="opacity-50">/ 0{projectsData.length}</span>
                    </p>
                    {/* Which kind of milestone this is — the whole path mixes work
                        built with places worked, so the badge does real work here. */}
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.3em] px-2.5 py-1 rounded-full border ${
                        isDarkMode ? 'border-black/25' : 'border-white/25'
                      }`}
                      style={{ color: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' }}
                    >
                      {stops[index]?.kind === 'role' ? 'Role' : 'Build'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight drop-shadow-md">
                      {project.title}
                    </h2>
                    {stops[index]?.role && (
                      <p className="text-lg md:text-xl font-light" style={{ color: isDarkMode ? '#333' : '#ddd' }}>
                        {stops[index].role}
                      </p>
                    )}
                    {stops[index] && (
                      <p
                        className="font-mono text-[11px] uppercase tracking-[0.25em]"
                        style={{ color: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)' }}
                      >
                        {formatRange(stops[index])}
                      </p>
                    )}
                  </div>

                  <p className="text-base md:text-lg leading-relaxed font-light" style={{ color: isDarkMode ? '#444' : '#ccc' }}>
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 my-2 justify-start">
                    {project.stack.map(tech => (
                      <span
                        key={tech}
                        className={`px-3 py-1 text-sm border rounded-full ${isDarkMode ? 'bg-black/5 border-black/20' : 'bg-white/10 border-white/20'}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* The causal chain. This single line is what turns a sequence of
                      adjacent facts into a story, so it is deliberately the last thing
                      read before the camera moves on. */}
                  {stops[index] && getLedTo(stops[index]) && (
                    <p
                      className="font-mono text-[11px] md:text-xs uppercase tracking-[0.25em]"
                      style={{ color: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)' }}
                    >
                      <span className="opacity-60">→ Led to</span>{' '}
                      <span style={{ color: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)' }}>
                        {getLedTo(stops[index])!.title}
                      </span>
                    </p>
                  )}

                  <div className="flex gap-4 mt-1 justify-start">
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
                        style={{
                          backgroundColor: isDarkMode ? '#000000' : `hsl(${project.accentColor})`,
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }}
                      >
                        <ExternalLink size={20} /> Open Project
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flyby labels. The marker itself rides the trail in scene space; the type
              stays here in screen space so the camera zoom can't magnify it. Sits under
              the porthole rather than in the card column — a flyby is something you
              pass, not something you stop to read. */}
          <div className="absolute inset-0 z-40 pointer-events-none">
            {flybys.map((flyby, fi) => {
              const m = flyby.milestone;
              return (
                <div
                  key={`flyby-label-${m.id}`}
                  className="absolute -translate-x-1/2"
                  style={{ left: '32%', top: '72%' }}
                >
                  <div
                    ref={(el) => { flybyLabelRefs.current[fi] = el; }}
                    className="flex flex-col items-center gap-1.5 text-center opacity-0"
                    style={{ color: isDarkMode ? '#000000' : '#ffffff' }}
                  >
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.4em]"
                      style={{ color: isDarkMode ? 'rgba(0,0,0,0.5)' : `hsl(${m.accentColor})` }}
                    >
                      Passing · {yearOf(m)}
                    </p>
                    <p className="text-xl md:text-2xl font-semibold tracking-tight whitespace-nowrap">
                      {m.title}
                    </p>
                    {m.role && (
                      <p
                        className="font-mono text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: isDarkMode ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)' }}
                      >
                        {m.role}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Orbiting quick-link satellites: small glassy icons revolving slowly around
              the focused planet's porthole; hover reveals the label, click opens the link */}
          <div className="absolute inset-0 z-[38] pointer-events-none">
            {projectsData.map((project, index) => {
              const orbitLinks = [
                ...(project.links.github ? [{ label: 'Repository', href: project.links.github, Icon: Github }] : []),
                ...(project.links.live ? [{ label: 'Live Site', href: project.links.live, Icon: ExternalLink }] : []),
              ];
              if (orbitLinks.length === 0) return null;
              return (
                <div
                  key={`orbit-ring-${project.id}`}
                  className="absolute"
                  style={{ left: '32%', top: '46%' }}
                >
                  <div
                    ref={(el) => orbitRingRefs.current[index] = el}
                    className="relative opacity-0 pointer-events-none"
                    style={{ width: '44vh', height: '44vh', marginLeft: '-22vh', marginTop: '-22vh' }}
                  >
                    <div className="absolute inset-0 tour-orbit-spin">
                      {orbitLinks.map((link, li) => {
                        const angleDeg = -30 + li * 180;
                        const angle = (angleDeg * Math.PI) / 180;
                        const xPct = 50 + 50 * Math.cos(angle);
                        const yPct = 50 + 50 * Math.sin(angle);
                        return (
                          <div
                            key={link.label}
                            className="absolute"
                            style={{ left: `${xPct}%`, top: `${yPct}%` }}
                          >
                            <div className="-translate-x-1/2 -translate-y-1/2">
                              <div className="tour-orbit-counterspin">
                                <a
                                  href={link.href}
                                  target="_blank" rel="noopener noreferrer"
                                  className="group relative flex items-center justify-center w-12 h-12 rounded-full border backdrop-blur-md transition-transform duration-300 hover:scale-110"
                                  style={{
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.55)',
                                    borderColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
                                    color: isDarkMode ? '#000000' : '#ffffff'
                                  }}
                                  aria-label={`${project.title} — ${link.label}`}
                                >
                                  <link.Icon size={18} />
                                  <span
                                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    style={{ color: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)' }}
                                  >
                                    {link.label}
                                  </span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Return to orbit — zooms back out to the full system */}
          <div
            id="tour-return"
            className="fixed bottom-6 inset-x-0 z-[90] flex justify-center opacity-0 pointer-events-none transition-opacity duration-500"
          >
            <button
              onClick={scrollToTop}
              className="font-mono text-[11px] uppercase tracking-[0.3em] px-5 py-2.5 rounded-full border backdrop-blur-md transition-transform hover:scale-105"
              style={{
                color: isDarkMode ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)',
                borderColor: isDarkMode ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'
              }}
            >
              ↩ Return to orbit
            </button>
          </div>

          {/* Outro (Contact) — surfaces as the system dims after the tour */}
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

      </div> {/* End of fade-in wrapper */}
    </div>
  );
};

// Phones get their own experience: the desktop page is a horizontal orbital map
// with a pinned scroll-scrubbed camera — a composition that cannot survive a
// portrait viewport (see MobileIndex for the vertical tour that replaces it).
const Index = () => {
  const isMobile = useMobileExperience();
  return isMobile ? <MobileIndex /> : <DesktopIndex />;
};

export default Index;
