import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Which home experience to render. The desktop Grand Tour is a wide horizontal
 * composition (sun anchored off-canvas left, pinned camera, cards in the right
 * 44%) that visibly breaks below ~1200px — planets bunch up and the right half
 * of the system falls off-canvas. Rule: anything under 1200 gets the vertical
 * tour, plus portrait windows up to 1400 (a portrait viewport can never fit
 * the horizontal composition, however wide it is).
 */
export function useMobileExperience() {
  const compute = () =>
    typeof window !== "undefined" &&
    (window.innerWidth < 1200 ||
      (window.innerWidth < 1400 && window.innerHeight > window.innerWidth));

  const [isMobileExperience, setIsMobileExperience] = React.useState(compute);

  React.useEffect(() => {
    const onResize = () => setIsMobileExperience(compute());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return isMobileExperience;
}

export function useIsMobile() {
  // Resolved synchronously so the first render already knows the device class —
  // otherwise mobile users would mount the desktop page for a frame (kicking off
  // its preloads and GSAP timelines) before swapping to the mobile one.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
