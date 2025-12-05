I want to upgrade my Theme Toggle logic to use the View Transitions API for a specific animation effect.

Currently, my theme switches instantly. I want to create a 'Solar Wind' effect where the new theme expands from the Right (where the toggle is) towards the Left (where the Sun is).

Please update my code in two parts:

1. The React Logic (in ThemeToggle.tsx or similar): Refactor my toggleTheme function.

Check if document.startViewTransition is supported.

If supported, wrap my setTheme state update inside document.startViewTransition(() => { setTheme(newTheme) }).

If not supported, just call setTheme(newTheme) directly (fallback).

2. The CSS (in index.css or App.css): Add the CSS View Transition rules to animate the switch.

Target: ::view-transition-new(root).

Animation: Create a keyframe animation called solar-wind-wipe.

Geometry: Use clip-path: circle(...).

Start: circle(0% at 100% 50%) (A tiny dot on the far right edge).

End: circle(150% at 100% 50%) (A huge circle expanding leftward to cover the screen).

Layering: Ensure ::view-transition-old(root) stays stationary behind the new view (z-index: -1, animation: none).

Timing: Make it 1.5s ease-in-out so it feels substantial.

Please write the updated React function and the exact CSS needed.