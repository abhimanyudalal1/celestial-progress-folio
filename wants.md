"I want to implement a 'Planet Split' animation for opening my project details.

Currently, my planet is a single div. I need to refactor the Planet component to support 'splitting in half' to reveal a modal.

Please update my Planet.tsx (and associated CSS) with this logic:

1. The HTML Structure: Replace the single .planet div with this wrapper structure:

JavaScript
<div className='planet-wrapper' onClick={handlePlanetClick}>
  {/* The Hidden Modal (z-index: 0) */}
  <div className='space-window' ref={windowRef}>
    <ProjectDetails data={projectData} />
  </div>

  {/* Left Half of Planet (z-index: 1) */}
  <div className='planet-half left-half' ref={leftHalfRef}>
    <div className='planet-sprite' /> {/* Same spinning animation */}
  </div>

  {/* Right Half of Planet (z-index: 1) */}
  <div className='planet-half right-half' ref={rightHalfRef}>
    <div className='planet-sprite right-offset' /> {/* Same spinning animation */}
  </div>
</div>
2. The CSS:

.planet-wrapper: Relative position, centered.

.planet-half: Absolute position, width 50%, height 100%, overflow: hidden.

.left-half: left: 0.

.right-half: right: 0.

.planet-sprite: The existing spinning pixel art animation.

Crucial: For the .right-half .planet-sprite, set margin-left: -100% (or similar) so it aligns perfectly to show the right side of the image.

.space-window: Absolute center, distinct 'Holographic' border styling, initially scale: 0 and opacity: 0.

3. The GSAP Animation (onClick):

Create a GSAP timeline.

Animate .left-half to x: -60px (move left).

Animate .right-half to x: 60px (move right).

Simultaneously, animate .space-window to scale: 1 and opacity: 1 (springy ease).

Add a 'Close' function that reverses this timeline.

Please generate the complete React component and CSS."