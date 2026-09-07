import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTheme } from '@/contexts/ThemeContext';

interface CosmicLoadingProps {
  onComplete: () => void;
  onRevealUI?: () => void; // New callback to reveal UI midway
  /** Fires when the 3D scene starts fading out, so the 2D starfield behind it can wake up. */
  onFadeStart?: () => void;
}

export const CosmicLoading: React.FC<CosmicLoadingProps> = ({ onComplete, onRevealUI, onFadeStart }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  // The intro plays exactly once per mount. Callbacks arrive as fresh closures on every
  // parent render, and the theme can flip mid-sweep — so both are read through refs and
  // the effect below has an empty dependency list. Previously any parent re-render during
  // the intro (image preload finishing, sceneReady flipping) tore down the WebGL scene and
  // restarted the 6s sweep from the top, which is what made the starfield sweep twice.
  const onCompleteRef = useRef(onComplete);
  const onRevealUIRef = useRef(onRevealUI);
  const onFadeStartRef = useRef(onFadeStart);
  onCompleteRef.current = onComplete;
  onRevealUIRef.current = onRevealUI;
  onFadeStartRef.current = onFadeStart;

  // Theme is snapshotted at mount so a toggle mid-intro can't restart the sweep.
  const [introDark] = useState(isDarkMode);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const dark = introDark;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(dark ? 0xffffff : 0x000000);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    camera.position.z = 1000;

    // The starfield renders at full device resolution: point sprites this small lose
    // contrast fast when the buffer is upscaled, and the field reads as thinner than it is.
    // The savings come from the buffers instead — antialias is pure cost on point sprites
    // (MSAA smooths polygon edges, and these have none), and with depthWrite/depthTest off
    // the depth and stencil attachments are never read, so they are not allocated at all.
    // alpha:false lets the compositor treat the canvas as opaque: the scene already clears
    // to a solid background, and the intro's fade-out is a CSS opacity on the wrapper.
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // --- The Pivot and World Group ---
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(-5000, 5000, 0);
    scene.add(pivotGroup);

    const worldGroup = new THREE.Group();
    worldGroup.position.set(5000, -5000, 0);
    pivotGroup.add(worldGroup);

    // --- Starfield ---
    const starCount = dark ? 120000 : 60000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 15000;
      starPositions[i + 1] = (Math.random() - 0.5) * 15000;
      starPositions[i + 2] = (Math.random() - 0.5) * 8000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, dark ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)');
      gradient.addColorStop(1, dark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 16, 16);
    }
    const starTexture = new THREE.CanvasTexture(canvas);

    // Deliberately kept on the textured sprite: a procedural falloff in a custom shader
    // measured no faster here, and it cut the faint outer halo of every star roughly in
    // half (mean frame luminance 0.40 -> 0.24), which reads as a thinner starfield.
    const starMaterial = new THREE.PointsMaterial({
      color: dark ? 0x000000 : 0xffffff,
      size: dark ? 14 : 6,
      map: starTexture,
      transparent: true,
      blending: dark ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      sizeAttenuation: true
    });

    const starfield = new THREE.Points(starGeometry, starMaterial);
    starfield.frustumCulled = false;
    worldGroup.add(starfield);

    // Start offset
    pivotGroup.rotation.z = -0.15;

    // --- GSAP Animation (The Cinematic Sweep) ---
    let completed = false;
    let completeTimer: ReturnType<typeof setTimeout> | undefined;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;

    const tl = gsap.timeline({
      onComplete: () => {
        completeTimer = setTimeout(() => {
          if (completed) return;
          completed = true;
          onCompleteRef.current?.();
        }, 500);
      }
    });

    // We can reveal the actual landing page UI midway through the sweep
    revealTimer = setTimeout(() => onRevealUIRef.current?.(), 2500);

    // The main sweeping rotation on Z-axis
    tl.to(pivotGroup.rotation, {
      z: 0,
      duration: 6, // Matches total planet sweep time (1s delay + 5s duration)
      ease: 'power3.out'
    }, 0); // Start at t=0

    // Fade out the 3D scene slightly at the end to seamlessly transition to the 2D Stars bg
    tl.to(mount, {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      onStart: () => onFadeStartRef.current?.()
    }, "-=1.5");

    const render = () => {
      renderer.render(scene, camera);
    };

    gsap.ticker.add(render);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(render);
      tl.kill();
      // These timers outlived the scene before, so a torn-down intro could still fire
      // its completion callbacks against a fresh one.
      clearTimeout(completeTimer);
      clearTimeout(revealTimer);

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      starGeometry.dispose();
      starMaterial.dispose();
      starTexture.dispose();
      renderer.dispose();
    };
  }, [introDark]);

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 z-10 pointer-events-none ${introDark ? 'bg-white' : 'bg-black'}`}
    />
  );
};
