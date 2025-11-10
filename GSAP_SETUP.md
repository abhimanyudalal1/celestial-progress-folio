# GSAP ScrollTrigger Setup Guide

## Overview
Your portfolio now has a GSAP ScrollTrigger animation structure that enables smooth scroll-based animations.

## Structure

### 1. HTML Structure (`index.html`)
- Added GSAP CDN links in the `<head>`:
  - `gsap.min.js` - Core GSAP library
  - `ScrollTrigger.min.js` - ScrollTrigger plugin
  - `MotionPathPlugin.min.js` - MotionPath plugin for path-based animations

### 2. React Structure (`src/pages/Index.tsx`)
The page is now divided into sections:

- **`.scroll-track`** - Main wrapper for all scrollable content
- **`.hero-pin`** - Section containing the solar system (will be pinned during scroll)
- **`.project-list`** - Section that appears after scrolling (hidden by default with `opacity: 0`)

### 3. CSS Styles (`src/index.css`)
Added styles for:
- `.scroll-track` - Main container
- `.hero-pin` - Pinned hero section (100vh)
- `.project-list` - Project list section with gradient background and initial opacity 0
- Smooth scrolling behavior

### 4. TypeScript Declarations (`src/gsap.d.ts`)
Type definitions for GSAP, ScrollTrigger, and MotionPathPlugin so you can use them with full TypeScript support.

### 5. Custom Hook (`src/hooks/use-scroll-trigger.ts`)
The `useScrollTrigger` hook handles:
- Pinning the hero section while scrolling
- Fading in the project list section
- Cleanup of ScrollTrigger instances

## Current Animation Behavior

1. **Hero Pin**: The solar system stays pinned for one viewport height of scrolling
2. **Project List Fade**: The project list section fades in as you scroll down

## How to Use GSAP in Your Components

```typescript
import { useEffect } from 'react';

useEffect(() => {
  if (typeof window !== 'undefined' && window.gsap) {
    const gsap = window.gsap;
    const MotionPathPlugin = window.MotionPathPlugin;
    
    // Register the plugin
    gsap.registerPlugin(MotionPathPlugin);
    
    // Simple animation
    gsap.to('.my-element', {
      x: 100,
      duration: 1
    });
    
    // With ScrollTrigger
    gsap.to('.my-element', {
      x: 100,
      scrollTrigger: {
        trigger: '.my-element',
        start: 'top center',
        end: 'bottom center',
        scrub: true
      }
    });
    
    // With MotionPath - animate along an SVG path
    gsap.to('.my-element', {
      motionPath: {
        path: '#my-svg-path',
        align: '#my-svg-path',
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
      },
      duration: 2
    });
  }
}, []);
```

## Next Steps - Suggested Animations

### 1. Planet to Card Animation
Animate planets from their orbits to the project list as cards:

```typescript
gsap.utils.toArray('.planet').forEach((planet, i) => {
  gsap.to(planet, {
    scrollTrigger: {
      trigger: '.project-list',
      start: 'top bottom',
      end: 'top center',
      scrub: 1,
    },
    x: 0, // Final position in project list
    y: 0,
    scale: 1,
    delay: i * 0.1
  });
});
```

### 2. Sun Transformation
Transform the sun from large to small logo:

```typescript
gsap.to('.sun', {
  scrollTrigger: {
    trigger: '.project-list',
    start: 'top bottom',
    end: 'top center',
    scrub: 1,
  },
  scale: 0.2,
  x: -window.innerWidth / 2 + 100, // Move to top-left
  y: -window.innerHeight / 2 + 100
});
```

### 3. Orbit Fade
Fade out the orbits as you scroll:

```typescript
gsap.to('.orbit-path', {
  scrollTrigger: {
    trigger: '.project-list',
    start: 'top bottom',
    end: 'top center',
    scrub: 1,
  },
  opacity: 0
});
```

### 4. Using MotionPathPlugin
Animate elements along curved SVG paths:

```typescript
// Register MotionPathPlugin
gsap.registerPlugin(window.MotionPathPlugin);

// Animate along an elliptical orbit
gsap.to('.planet', {
  motionPath: {
    path: [
      { x: 0, y: 0 },
      { x: 100, y: -50 },
      { x: 200, y: 0 },
      { x: 100, y: 50 },
      { x: 0, y: 0 }
    ],
    curviness: 1.5,
    autoRotate: true
  },
  scrollTrigger: {
    trigger: '.project-list',
    start: 'top bottom',
    end: 'top center',
    scrub: 1
  }
});

// Or use an SVG path element
gsap.to('.planet', {
  motionPath: {
    path: '#orbit-path', // ID of SVG path element
    align: '#orbit-path',
    alignOrigin: [0.5, 0.5],
    start: 0,
    end: 1
  },
  duration: 2
});
```

## Debugging

Enable markers to see ScrollTrigger points:
```typescript
ScrollTrigger.create({
  trigger: '.hero-pin',
  markers: true, // Set to true
  // ...other options
});
```

## Resources
- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Documentation](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [MotionPathPlugin Documentation](https://greensock.com/docs/v3/Plugins/MotionPathPlugin)
- [GSAP ScrollTrigger Demos](https://greensock.com/st-demos/)
