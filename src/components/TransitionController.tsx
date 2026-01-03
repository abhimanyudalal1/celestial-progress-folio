import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTransition } from '@/contexts/TransitionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SOLAR_CONFIG, getPlanetPosition, getOrbitRadii, getPlanetAngle } from '@/lib/solar-system-config';
import gsap from 'gsap';
import { toLegacyProjects } from "@/data/projects";
import { useWindowSize } from '@/hooks/use-window-size';

const projects = toLegacyProjects();

export const TransitionController = () => {
    const { transitionState, completeTransition, resetTransition } = useTransition();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const containerRef = useRef<HTMLDivElement>(null);
    const sunRef = useRef<HTMLDivElement>(null);
    const planetsRef = useRef<(SVGGElement | null)[]>([]);
    const textRef = useRef<HTMLDivElement>(null);
    const curtainRef = useRef<HTMLDivElement>(null);
    const ghostNavbarRef = useRef<HTMLDivElement>(null);

    const dimensions = useWindowSize(); // Debounced resize hook

    // Reset transition state if we are back at root

    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    // Reset transition state if we are back at root
    useEffect(() => {
        if (location.pathname === '/' && transitionState === 'projects') {
            resetTransition();
        }
    }, [location.pathname]);

    // Use a separate effect to trigger the animation ONCE when state changes to 'transitioning'
    useEffect(() => {
        if (transitionState === 'transitioning') {
            // If already animating, do nothing (prevent restart on resize/theme change)
            if (timelineRef.current && timelineRef.current.isActive()) return;

            // Kill any existing timeline just in case
            if (timelineRef.current) timelineRef.current.kill();

            const timeline = gsap.timeline({
                onComplete: () => {
                    completeTransition();
                    timelineRef.current = null;
                }
            });
            timelineRef.current = timeline;

            // 1. Initial Setup
            // Deployment Fix: Reset Scroll to ensure coordinate system is clean
            window.scrollTo(0, 0);

            if (sunRef.current) gsap.set(sunRef.current, { zIndex: 50 });

            // Initialize Planet Positions via GSAP to prevent React re-render reset
            const { viewBoxWidth, viewBoxLeft, viewBoxHeight, sunCenterX, sunCenterY } = SOLAR_CONFIG;
            const orbitRadii = getOrbitRadii(Math.min(dimensions.width, dimensions.height));

            projects.forEach((project, i) => {
                const el = planetsRef.current[i];
                if (el) {
                    const angle = getPlanetAngle(project.orbitIndex);
                    const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
                    const ellipseRx = radius;
                    const ellipseRy = radius * 0.65;
                    const pos = getPlanetPosition(ellipseRx, ellipseRy, sunCenterX, sunCenterY, angle);

                    gsap.set(el, { x: pos.x, y: pos.y });
                }
            });

            // Ensure Curtain covers everything immediately
            if (curtainRef.current) {
                gsap.set(curtainRef.current, {
                    opacity: 1,
                    zIndex: 0 // Behind planets
                });
            }

            // 2. Sun Morph -> Navbar Background (Top)
            // Deployment Fix: Dynamic Coordinate Fetching
            // We use a "Ghost Navbar" to measure the exact target position
            let targetTop = 8; // fallback
            let targetLeft = window.innerWidth / 2; // fallback
            let targetWidth = 950; // fallback
            let targetHeight = 60; // fallback

            if (ghostNavbarRef.current) {
                const navBounds = ghostNavbarRef.current.getBoundingClientRect();
                targetTop = navBounds.top;
                targetLeft = navBounds.left;
                targetWidth = navBounds.width;
                targetHeight = navBounds.height;
            }

            const sunTween = gsap.to(sunRef.current, {
                top: targetTop,
                left: targetLeft,
                width: targetWidth,
                height: targetHeight,
                xPercent: 0, // Clear previous centering transform
                yPercent: 0,
                x: 0,
                y: 0,
                transform: 'none', // Nuke any other transforms
                borderRadius: "9999px", // Pill shape
                boxSizing: 'border-box',
                // Night/Grey Mode: Deep Charcoal BG
                background: isDarkMode ? '#121212' : 'linear-gradient(135deg, #fbbf24, #ef4444)',
                // Border: Moon Glow (Slate 200/400 gradient approximation via solid border for GSAP or just white)
                // Since actual navbar has complex gradient border, we approximate here or remove it if it clashes?
                // Real navbar has a padding based gradient border. 
                // Let's use a subtle white border.
                border: isDarkMode ? '1px solid rgba(226, 232, 240, 0.5)' : 'none',
                // Box Shadow: Moon Glow
                boxShadow: isDarkMode
                    ? "0 0 20px rgba(226, 232, 240, 0.4)"
                    : "0 0 450px 75px rgba(255, 100, 0, 0.6)",
                duration: 0.5,
                ease: "power2.inOut"
            });

            // 3. Planets: Converge to Top Center
            const svgCenterX = viewBoxLeft + viewBoxWidth / 2;
            const svgTopY = 50; // Near top edge of SVG viewBox

            const convergenceTween = gsap.to(planetsRef.current, {
                x: svgCenterX,
                y: svgTopY, // Top Center
                scale: 0.4,
                opacity: 1,
                // Planet Desaturation: Grayscale and reduced brightness
                filter: isDarkMode ? "grayscale(80%) brightness(0.7)" : "none",
                stagger: 0.05,
                duration: 0.8,
                ease: "power2.inOut"
            });

            timeline.add(sunTween, 0);
            timeline.add(convergenceTween, "<0.2");

            // 3.5 Text Reveal with Mist/Smoke Effect
            if (textRef.current) {
                // Ensure text is visible initially (but blurred/transparent)
                gsap.set(textRef.current, {
                    opacity: 0,
                    filter: "blur(10px)",
                    scale: 0.9
                });

                timeline.to(textRef.current, {
                    opacity: 1,
                    filter: "blur(0px)",
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out"
                }, "<0.1"); // Start shortly after convergence starts, while curtain is still there

                // Mist slide out
                timeline.to(textRef.current, {
                    opacity: 0,
                    filter: "blur(5px)",
                    scale: 1.1,
                    duration: 0.5,
                    ease: "power2.in"
                }, ">0.5"); // Stay visible for 0.5s then fade out
            }

            // 4. Planets: Split to 5 equal distances
            // Screen width consists of 5 columns.
            // We want planets to end up at centers of these columns.
            // Col width = 100% / 5 = 20%.
            // Centers: 10%, 30%, 50%, 70%, 90%.
            // We need to map these Screen X % to SVG X coordinates.
            // SVG Width = 3000. Left = -800.
            // 0% Screen = -800 SVG X.
            // 100% Screen = -800 + 3000 = 2200 SVG X.
            // Range = 3000.

            // Calc target X for each planet (index i: 0..4)
            // But wait, the planets array order might not match left-to-right columns?
            // Let's assume index 0 -> Col 1, etc.

            const splitTween = gsap.to(planetsRef.current, {
                x: (i) => {
                    // i is index of planet (0 to 4)
                    const percent = 0.1 + (i * 0.2); // 0.1, 0.3, 0.5, 0.7, 0.9
                    // Map to SVG coordinates
                    return viewBoxLeft + (viewBoxWidth * percent);
                },
                y: svgTopY + 40, // Slightly lower? Or stay at top
                scale: 0.4, // Grow slightly?
                duration: 0.8,
                ease: "back.out(1.2)", // Bounce a bit into place
            });

            timeline.add(splitTween, ">-0.1"); // Start after convergence finishes

            // 5. Navigate (Load new page underneath)
            timeline.call(() => {
                navigate('/grid-view');
            }, undefined, "<0.4"); // Call halfway through split

            // 6. Text Reveal (Handled above in 3.5)
            // We removed the set opacity 0 call from here.

            // 7. Curtain Reveal
            // ... (rest of the code)
            if (curtainRef.current) {
                timeline.to(curtainRef.current, {
                    opacity: 0, // Reveal underlying page
                    duration: 0.8,
                    ease: "power2.inOut"
                }, ">"); // After split is done
            }

            // 8. Planets Fade out/Merge?
            // ...
            timeline.to(planetsRef.current, {
                opacity: 0,
                duration: 0.5
            }, "<0.2"); // Fade out while curtain reveals

            // 9. Sun Pill Fade Out
            // User requested: "pill instead of immediately vanishing should fade its opacity quickly"
            if (sunRef.current) {
                timeline.to(sunRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut"
                }, "<"); // Sync with planets fade out
            }
        } else {
            // If state changes away from 'transitioning', kill timeline
            if (timelineRef.current) {
                timelineRef.current.kill();
                timelineRef.current = null;
            }
        }
    }, [transitionState]); // Only re-run when transition state changes, ignoring component updates during animation!

    if (transitionState === 'hero') return null;

    // Render the "Fake" Overlay using shared config
    const baseDimension = Math.min(dimensions.width, dimensions.height);
    const { viewBoxWidth, viewBoxHeight, viewBoxLeft, sunCenterX, sunCenterY } = SOLAR_CONFIG;
    const orbitRadii = getOrbitRadii(baseDimension);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
            style={{
                visibility: transitionState === 'transitioning' ? 'visible' : 'hidden'
            }}
        >
            {/* Ghost Navbar for Measurement - Matches DynamicNavbar Desktop Styles */}
            <div
                ref={ghostNavbarRef}
                className="hidden md:fixed md:top-2 md:left-1/2 md:transform md:-translate-x-1/2 md:flex md:items-center md:gap-16 md:z-50 md:px-10 md:py-1.5 opacity-0 pointer-events-none"
                style={{
                    borderRadius: '9999px',
                    width: 'max-content', // Allow it to expand naturally based on content
                    minWidth: '950px', // Enforce minimum width to match the real navbar's substantial size
                }}
            >
                {/* Replicating DynamicNavbar Content Exactly for Width Calculation */}
                <div className="px-6 py-3 font-bold text-lg tracking-wide">Abhimanyu</div>
                <div className="px-6 py-3 font-bold text-lg tracking-wide">Blogs</div>
                <div className="px-6 py-3 font-bold text-lg tracking-wide">Projects</div>
                <div className="px-6 py-3 font-bold text-lg tracking-wide">About</div>

                {/* Theme Toggle Placeholder (ml-4) */}
                <div className="ml-4 w-12 h-8"></div>
            </div>

            {/* Curtain for reveal effect */}
            <div
                ref={curtainRef}
                className="absolute inset-0 bg-background" // Use theme background
                style={{
                    zIndex: -1
                }}
            />

            <div className="relative w-full h-full">
                {/* Fake Sun DIV */}
                <div
                    ref={sunRef}
                    className="absolute rounded-full z-50 flex items-center justify-center overflow-hidden"
                    style={{
                        left: '3.333%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',

                        height: `${baseDimension * 0.9}px`,
                        width: `${baseDimension * 0.9}px`,

                        background: isDarkMode
                            ? 'linear-gradient(135deg, #f8fafc, #94a3b8)' // White/Slate gradient (Moon-like)
                            : 'linear-gradient(135deg, #fbbf24, #ef4444)', // Yellow/Orange
                    }}
                >
                    {/* We can put the image inside if we want perfect match, 
                 but a gradient might be enough for the "morph" effect? */}
                </div>

                {/* Fake Planets SVG */}
                <svg
                    className="w-full h-full absolute inset-0 pointer-events-none"
                    viewBox={`${viewBoxLeft} 0 ${viewBoxWidth} ${viewBoxHeight}`}
                    preserveAspectRatio="xMinYMid meet"
                >
                    {projects.map((project, i) => {
                        const angle = getPlanetAngle(project.orbitIndex);
                        // We need 3D perspective calc?
                        // SolarSystem uses `getPlanetPosition` with ellipsed X/Y.
                        // But it ALSO puts them in a `perspective` container div?
                        // "3D Stage Container with Perspective... transform: rotateX(25deg) rotateY(-8deg)"

                        // If we want EXACT match, we need to reproduce the container transform.
                        // It's hard to animate from that 3D transform to "Center of Screen 2D".

                        // Approximate: 
                        // Just use 2D positions for the "Fake" planets starting points?
                        // If the user accepts "Fly from orbits", they might tolerate a slight jump 
                        // if the transition starts.

                        // Let's try to calculate the 2D projected position?
                        // Too complex for now.

                        // Let's just use the `getPlanetPosition` raw values.
                        // The 3D transform mainly squashes them.

                        const radius = orbitRadii[`r${project.orbitIndex}` as keyof typeof orbitRadii] || 200;
                        const ellipseRx = radius;
                        const ellipseRy = radius * 0.65;
                        const pos = getPlanetPosition(ellipseRx, ellipseRy, sunCenterX, sunCenterY, angle);

                        return (
                            <g
                                key={project.id}
                                ref={el => planetsRef.current[i] = el}
                            >
                                <circle r={baseDimension * 0.04} fill={isDarkMode ? '#e2e8f0' : `hsl(${project.accentColor})`} />
                            </g>
                        );
                    })}
                </svg>

                {/* Centered Text - Initially Hidden */}
                <div
                    ref={textRef}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 z-[100] pointer-events-none"
                >
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                        PROJECTS
                    </h1>
                </div>
            </div>
        </div>
    );
};
