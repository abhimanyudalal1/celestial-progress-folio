import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTransition } from '@/contexts/TransitionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SOLAR_CONFIG, getPlanetPosition, getOrbitRadii, getPlanetAngle } from '@/lib/solar-system-config';
import gsap from 'gsap';
import { toLegacyProjects } from "@/data/projects";

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

    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Update dimensions on resize match SolarSystem
    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset transition state if we are back at root
    useEffect(() => {
        if (location.pathname === '/' && transitionState === 'projects') {
            resetTransition();
        }
    }, [location.pathname]);

    useEffect(() => {
        if (transitionState === 'transitioning') {
            const timeline = gsap.timeline({
                onComplete: () => {
                    completeTransition();
                }
            });

            // 1. Initial Setup
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
            const sunTween = gsap.to(sunRef.current, {
                top: "8px", // Match md:top-2
                left: "50%",
                xPercent: -50, // Center horizontally
                x: 0, // Clear pixel transform
                width: "950px", // Approximate navbar width
                height: "60px", // Approximate navbar height
                borderRadius: "9999px", // Pill shape
                y: 0,
                // Using spread radius (4th value) to increase excessive size without just blurring it out
                boxShadow: "0 0 450px 75px rgba(255, 100, 0, 0.6)",
                duration: 1.0,
                ease: "power2.inOut"
            });

            // 3. Planets: Converge to Top Center
            // Target: Center X, Top Y (e.g. inside the new navbar area)
            // Use SVG coordinates? No, if we want them to align with screen columns, 
            // we should probably start using screen pixels or percentage for the split.
            // But they start in SVG space.
            // Let's move them to SVG Center X, and SVG Top Y.

            // 3. Planets: Converge to Top Center
            const svgCenterX = viewBoxLeft + viewBoxWidth / 2;
            const svgTopY = 50; // Near top edge of SVG viewBox

            const convergenceTween = gsap.to(planetsRef.current, {
                x: svgCenterX,
                y: svgTopY, // Top Center
                scale: 0.4,
                opacity: 1,
                stagger: 0.05,
                duration: 0.8,
                ease: "power2.inOut"
            });

            timeline.add(sunTween, 0);
            timeline.add(convergenceTween, "<0.2");

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

            // 6. Text Reveal (Optional? Maybe "PROJECTS" appears in center before split?)
            // User didn't mention text this time, but "final transition over".
            // Let's keep a quick text flash or remove it if it clashes.
            // Let's fade out the text if it was there.
            if (textRef.current) gsap.set(textRef.current, { opacity: 0 });

            // 7. Curtain Reveal
            // "Final transition over"
            // We reveal the columns underneath.
            // Since planets are now at column headers, we can have the curtain 
            // wipe down or fade out?
            // "The screen 'splits' or 'spreads' out from that center point" was previous request.
            // Now: "Final transition over".
            // Let's assume we fade out the black curtain to reveal the colored columns 
            // (which likely match the planet colors/positions).

            if (curtainRef.current) {
                timeline.to(curtainRef.current, {
                    opacity: 0, // Reveal underlying page
                    duration: 0.8,
                    ease: "power2.inOut"
                }, ">"); // After split is done
            }

            // 8. Planets Fade out/Merge?
            // Usually they should merge into the page headers.
            // Assuming the new page has these headers.
            // Let's fade them out as the curtain reveals (or stay if they match).
            // Safe bet: Fade them out with the curtain?
            // Actually if they are "colored columns", maybe the planets ARE the source?
            // Let's keep them visible for now, or fade out at end.
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
        }
    }, [transitionState, dimensions, navigate, completeTransition]);

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
                // If we are 'projects', we might want to hide this controller or keep it for the fade out?
                // Actually for now let's keep it visible during 'transitioning'.
                // Once 'projects' state is reached, the real page is there.
                // We might need to fade this out or keep the sun bar?
                // Requirement says: Start transition -> Hide real Hero -> Show Overlay -> Animate.
                visibility: transitionState === 'transitioning' ? 'visible' : 'hidden'
            }}
        >
            {/* Curtain for reveal effect - Initially covers everything with a small circle or invisible? 
            Wait, the requirement says: "animate the clip-path of the actual Projects Page"
            OR we can use this overlay to mask the reveal.
            Let's assume this overlay COVERS the screen, and we "cut a hole" or fade it out?
            "The screen 'splits' or 'spreads' out from that center point"
            
            Strategy:
            The Overlay contains the Sun and Planets.
            Underneath is the NEW Page (Projects).
            We want to reveal the new page FROM the center.
            So we can have a black/background curtain on top of the Routes, 
            and we animate its clip-path to Open.
         */}
            <div
                ref={curtainRef}
                className="absolute inset-0 bg-background" // Use theme background (white/black) to cover old page
                // This ensures that when the planets unite, the background is solid behind them,
                // hiding the "Old Hero" mess, and then we "un-clip" or fade this out to show the new page?
                // Actually, if we animate clipPath -> 0, this layer shrinks away.
                // So we want it opaque.
                style={{
                    zIndex: -1 // Behind the planets/sun but covering the page?
                    // No, this whole component is z-9999.
                    // The curtain is the background of this overlay.
                }}
            />

            <div className="relative w-full h-full">
                {/* Fake Sun */}
                {/* We need to position it exactly where the SVG sun is. 
             The SVG sun is at sunCenterX, sunCenterY in the viewBox. 
             We need to map SVG coordinates to Screen coordinates?
             No, SolarSystem uses a full-screen SVG. We can replicate that.
         */}

                {/* However, animating an SVG element `transform` is harder to morph into a HTML navbar div.
             Requirements say: "The Sun (yellow circle) must animate... to become the background of the Navbar"
             HTML div is easier to morph than SVG circle.
             
             Let's use an HTML div for the Fake Sun, positioned absolutely.
             We need to calculate its pixel position corresponding to the SVG position.
             
             SolarSystem SVG: viewBoxLeft (-800) to (-800 + 3000)
             Screen width: dimensions.width
             
             Scale = dimensions.width / 3000 ? No, preserveAspectRatio="xMinYMid meet".
             "meet" means it scales to fit the smaller dimension (usually width in landscape?)
             
             Actually `preserveAspectRatio="xMinYMid meet"` matches:
             Min-X aligns with left.
             Mid-Y aligns with center.
             
             If screen ratio > viewBox ratio (ultra wide): Height limits.
             If screen ratio < viewBox ratio (tall): Width limits.
             
             ViewBox: 3000 x 1000 => Ratio 3:1.
             Screen: 1920 x 1080 => Ratio 1.77.
             So Width is the limiting factor? No, 3000 is very wide.
             Wait, 3000 / 1000 = 3.
             1920 / 1080 = 1.77.
             So to fit 3000 width into 1920, we scale down largely.
             Height would be 1000 * scale. 
             If scale = 1920/3000 = 0.64. Height = 640.
             But screen height is 1080. 640 < 1080.
             "meet" ensures ENTIRE viewBox is visible.
             So yes, Width limits it. 
             
             Actually SolarSystem uses `preserveAspectRatio="xMinYMid meet"`.
             And `viewBoxLeft = -800`.
             
             Let's replicate the SVG structure exactly for the Planets (easier for them to fly to center).
             But for the Sun, we might want an HTML element on top?
             The SVG Sun is complex (Gradients, Images).
             
             Let's try to animate the SVG Circle itself?
             Or just a "Mask" div that matches the position.
             
             Let's place the sun using the SAME shared config values inside an SVG first, 
             then try to tween it... 
             Actually, `gsap` can tween SVG attributes.
             But morphing an SVG circle to a full-width HTML Navbar background is tricky.
             
             Alternative: Use an HTML div that is positioned using `left: X%`, `top: Y%` that approximates the sun position.
             Sun Center: (-700, 500) in (3000 x 1000) space.
             Relative to ViewBox:
             X = (-700 - (-800)) / 3000 = 100 / 3000 = 3.33% from left.
             Y = 500 / 1000 = 50% from top.
             
             So the Sun is at 3.33% Left, 50% Top.
             With `xMin` alignment, 0% viewBox X = 0% Screen X.
             So Sun Center X is 3.33% of Screen Width (if Width limits).
             
             Wait, if Height limits (e.g. super wide screen), then scaling is different.
             But assuming standard 16:9, Width likely limits if ViewBox is 3:1.
             
             Let's use a "Fake Sun" div at `left: 3.33%`, `top: 50%`.
             Width/Height: `baseDimension * 1.8`? No, SVG units.
             `baseDimension` in SolarSystem is `Math.min(w, h)`.
             
             Let's render the EXACT SAME SVG structure for the planets.
             For the Sun, we render a `motion.div` or just `div` inside the container, 
             and we set its initial styles to match the sun.
          */}

                {/* Fake Sun DIV */}
                <div
                    ref={sunRef}
                    className="absolute rounded-full z-50 flex items-center justify-center overflow-hidden"
                    style={{
                        // Approximate position calculation used in SolarSystem logic
                        // calculated purely for visual match
                        // Logic: 
                        // SVG X: -700. ViewBox Left: -800. Width: 3000.
                        // Screen X% = (-700 - (-800)) / 3000 = 100 / 3000 = 3.333%
                        // BUT this assumes the ViewBox fills the width exactly.
                        // If screen is 1920, WB is 3000 scaled to 1920.
                        // So yes, 3.33% of 1920.

                        left: '3.333%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)', // Center the div on that point

                        // Size: baseDimension * 1.8 (image size).
                        // But wait, the image is huge.
                        // ClipPath radius: baseDimension * 0.9.
                        // Diameter = 1.8 * baseDimension.
                        // Again, BaseDimension is usually Height (1080).
                        // So Diameter approx 1900px? That seems HUGE.
                        // Ah, the Sun in Hero is huge, occupying most of the left side.

                        // Let's start with a smaller size that "looks" like the visible core?
                        // Or just the full size.
                        height: `${baseDimension * 0.9}px`,
                        width: `${baseDimension * 0.9}px`,

                        background: 'linear-gradient(135deg, #fbbf24, #ef4444)', // Yellow/Orange
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
                                <circle r={baseDimension * 0.04} fill={`hsl(${project.accentColor})`} />
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
