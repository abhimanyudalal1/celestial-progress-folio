import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTheme } from '@/contexts/ThemeContext';

interface CosmicLoadingProps {
  onComplete: () => void;
  onRevealUI?: () => void; // New callback to reveal UI midway
}

export const CosmicLoading: React.FC<CosmicLoadingProps> = ({ onComplete, onRevealUI }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0xffffff : 0x000000);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- The Pivot and World Group ---
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(-5000, 5000, 0); 
    scene.add(pivotGroup);

    const worldGroup = new THREE.Group();
    worldGroup.position.set(5000, -5000, 0);
    pivotGroup.add(worldGroup);

    // --- Starfield ---
    const starCount = isDarkMode ? 120000 : 60000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 15000;
      starPositions[i + 1] = (Math.random() - 0.5) * 15000;
      starPositions[i + 2] = (Math.random() - 0.5) * 8000;
      starSizes[i / 3] = Math.random() * 2;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, isDarkMode ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)');
      gradient.addColorStop(1, isDarkMode ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 16, 16);
    }
    const starTexture = new THREE.CanvasTexture(canvas);

    const starMaterial = new THREE.PointsMaterial({
      color: isDarkMode ? 0x000000 : 0xffffff,
      size: isDarkMode ? 14 : 6,
      map: starTexture,
      transparent: true,
      blending: isDarkMode ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const starfield = new THREE.Points(starGeometry, starMaterial);
    worldGroup.add(starfield);

    // Start offset
    pivotGroup.rotation.z = -0.15; 

    // --- GSAP Animation (The Cinematic Sweep) ---
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 500); 
      }
    });

    // We can reveal the actual landing page UI midway through the sweep
    if (onRevealUI) {
      setTimeout(onRevealUI, 2500); // 2.5 seconds into the sweep, start revealing UI
    }

    // The main sweeping rotation on Z-axis
    tl.to(pivotGroup.rotation, {
      z: 0,
      duration: 6, // Matches total planet sweep time (1s delay + 5s duration)
      ease: 'power3.out'
    }, 0); // Start at t=0
    
    // Fade out the 3D scene slightly at the end to seamlessly transition to the 2D Stars bg
    tl.to(mountRef.current, {
      opacity: 0,
      duration: 1.5,
      ease: 'power2.inOut'
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
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      starGeometry.dispose();
      starMaterial.dispose();
      starTexture.dispose();
      renderer.dispose();
    };
  }, [onComplete, onRevealUI, isDarkMode]);

  return (
    <div 
      ref={mountRef} 
      className={`fixed inset-0 z-10 pointer-events-none ${isDarkMode ? 'bg-white' : 'bg-black'}`} 
    />
  );
};
