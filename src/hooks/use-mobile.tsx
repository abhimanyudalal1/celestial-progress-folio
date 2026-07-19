import * as React from "react";

const MOBILE_BREAKPOINT = 768;

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
