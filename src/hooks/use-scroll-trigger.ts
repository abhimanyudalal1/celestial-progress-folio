import { useEffect } from 'react';

/**
 * Hook to initialize GSAP ScrollTrigger animations for the solar system portfolio
 * 
 * This hook will:
 * 1. Pin the hero section while scrolling
 * 2. Animate planets from orbits to the project list
 * 3. Fade in the project list section
 */
export const useScrollTrigger = () => {
  useEffect(() => {
    // Check if GSAP is loaded
    if (typeof window === 'undefined' || !window.gsap || !window.ScrollTrigger) {
      console.warn('GSAP or ScrollTrigger not loaded');
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Add class to html for scroll control
    document.documentElement.classList.add('gsap-controlling');

    // Pin the hero section while scrolling
    const heroPin = ScrollTrigger.create({
      trigger: '.hero-pin',
      start: 'top top',
      end: '+=100%', // Pin for one viewport height
      pin: true,
      pinSpacing: true,
      markers: false, // Set to true for debugging
      anticipatePin: 1,
    });

    // Fade in the project list section
    const projectListTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.project-list',
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1,
        markers: false, // Set to true for debugging
      }
    });

    projectListTl.to('.project-list', {
      opacity: 1,
      duration: 1,
    });

    // Cleanup function
    return () => {
      heroPin.kill();
      projectListTl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      document.documentElement.classList.remove('gsap-controlling');
    };
  }, []);
};
