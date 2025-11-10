# GSAP Three-Stage Animation Implementation

## Overview
Successfully implemented a three-stage scroll-triggered animation where planets move along orbits, detach to landing spots, and cross-fade between the solar system and project list views.

## Implementation Details

### React Refs Structure
```typescript
// Container and animation elements
const containerRef = useRef<HTMLDivElement>(null);
const sunRef = useRef<SVGGElement>(null);
const orbitsRef = useRef<SVGGElement>(null);

// Planet refs (for animation)
const planet1Ref through planet5Ref = useRef<SVGGElement>(null);
const planetRefs = [planet1Ref, planet2Ref, ...];

// Landing spot refs (for final positions)
const project1SpotRef through project5SpotRef = useRef<HTMLDivElement>(null);
const projectSpotRefs = [project1SpotRef, project2SpotRef, ...];

// Project list container
const projectListRef = useRef<HTMLDivElement>(null);
```

### DOM Structure
```html
<section ref={containerRef} className="hero-pin">
  <!-- WORLD 1: Solar System (visible initially) -->
  <div className="solar-system" style="z-index: 5; opacity: 1">
    <!-- SVG with sun, orbits, and planets -->
  </div>

  <!-- WORLD 2: Project List (hidden initially) -->
  <div ref={projectListRef} style="z-index: 1; opacity: 0">
    <div ref={project1SpotRef}>Project 1 Card</div>
    <div ref={project2SpotRef}>Project 2 Card</div>
    <!-- ... -->
  </div>
</section>
```

## Animation Timeline

### Stage 1: Orbital Motion
**Duration**: 2 seconds
**Position**: Timeline time 0

All planets move simultaneously along their respective orbit paths using MotionPathPlugin:
```typescript
planetRefs.forEach((planetRef, index) => {
  masterTimeline.to(planetRef.current, {
    motionPath: {
      path: `#orbit-path-${index + 1}`,
      align: `#orbit-path-${index + 1}`,
      alignOrigin: [0.5, 0.5],
      start: 0,
      end: 0.75, // Move 75% around orbit
    },
    duration: 2,
    ease: 'none',
  }, 0); // All start at time 0
});
```

### Stage 2: Detachment
**Label**: `"detach_point"`
**Timing**: All animations start simultaneously at this label

#### Get Final Coordinates
Before creating the timeline, get exact landing spot positions:
```typescript
const spot1Rect = project1SpotRef.current?.getBoundingClientRect();
const spot2Rect = project2SpotRef.current?.getBoundingClientRect();
// ... for all spots

const spotRects = [spot1Rect, spot2Rect, spot3Rect, spot4Rect, spot5Rect];
```

#### Animate Planets to Landing Spots
```typescript
planetRefs.forEach((planetRef, index) => {
  const spotRect = spotRects[index];
  const finalX = spotRect.left + spotRect.width / 2;
  const finalY = spotRect.top + spotRect.height / 2;
  
  masterTimeline.to(planetRef.current, {
    x: finalX,
    y: finalY,
    scale: 0.8,
    opacity: 1,
    duration: 1.5,
    ease: 'power2.out',
  }, "detach_point");
});
```

#### Fade Out Orbits
```typescript
masterTimeline.to(orbitsRef.current, {
  opacity: 0,
  duration: 1,
}, "detach_point");
```

### Stage 3: Cross-Fade
**Timing**: Also starts at `"detach_point"` (simultaneous with Stage 2)

#### Fade Out Solar System
```typescript
masterTimeline.to('.solar-system', {
  opacity: 0,
  duration: 1.5,
  ease: 'power2.inOut',
}, "detach_point");
```

#### Fade In Project List
```typescript
masterTimeline.to(projectListRef.current, {
  opacity: 1,
  duration: 1.5,
  ease: 'power2.inOut',
}, "detach_point");
```

#### Transform Sun
```typescript
masterTimeline.to(sunRef.current, {
  scale: 0.2,
  x: -window.innerWidth / 2 + 100,
  y: -window.innerHeight / 2 + 100,
  duration: 1.5,
}, "detach_point");
```

## ScrollTrigger Configuration

```typescript
const masterTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '.scroll-track',
    start: 'top top',
    end: '+=200%', // Scroll 2 viewport heights
    pin: '.hero-pin',
    scrub: 1, // Smooth scrubbing
    markers: false, // Set true for debugging
    anticipatePin: 1,
  }
});
```

## React Best Practices

### useEffect with GSAP Context
```typescript
useEffect(() => {
  // Check if GSAP is loaded
  if (!window.gsap || !window.ScrollTrigger || !window.MotionPathPlugin) {
    console.warn('GSAP plugins not loaded');
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const MotionPathPlugin = window.MotionPathPlugin;

  // Register plugins
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  // Wait for DOM to be ready
  requestAnimationFrame(() => {
    // Get coordinates
    const spotRects = projectSpotRefs.map(ref => 
      ref.current?.getBoundingClientRect()
    );

    // Create scoped context
    const ctx = gsap.context(() => {
      // All animations here
    }, containerRef);

    // Cleanup
    return () => {
      ctx.revert();
    };
  });
}, []); // Run once on mount
```

### Proper Cleanup
The `ctx.revert()` call automatically:
- Kills all GSAP animations
- Removes ScrollTrigger instances
- Prevents memory leaks
- Works with React Strict Mode

## Key Features

✅ **All animations use React refs** - No `document.querySelector`
✅ **Scoped with gsap.context()** - Clean and automatic cleanup
✅ **Exact coordinate targeting** - Planets land precisely on cards
✅ **Synchronized timing** - All detachment animations start together
✅ **Cross-fade effect** - Smooth transition between two worlds
✅ **Timeline labels** - Clean, readable animation sequencing

## Debugging

Enable markers to visualize ScrollTrigger points:
```typescript
scrollTrigger: {
  // ...other options
  markers: true, // Shows trigger points in viewport
}
```

## Complete Animation Flow

1. **User scrolls down** → Hero pins
2. **Stage 1** (0-2s): Planets orbit in sync
3. **Label**: "detach_point" added
4. **Stage 2** (at detach_point): 
   - Planets fly to exact landing spot coordinates
   - Orbits fade out
5. **Stage 3** (at detach_point, simultaneous):
   - Solar system fades out
   - Project list fades in
   - Sun shrinks and moves to corner
6. **Animation complete** → Unpin, show full project list

## Files Modified

- `/src/components/SolarSystem.tsx` - Main component with animation logic
- `/src/gsap.d.ts` - Added `addLabel` method to GSAPTimeline interface
- `/src/index.css` - Styles for hero-pin and project-list

## Result

A seamless, scroll-driven animation that:
- Shows planets orbiting the sun
- Detaches planets to land on their respective project cards
- Cross-fades between the orbital view and the final project list
- All controlled by scroll position with smooth scrubbing
