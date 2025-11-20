import { PlanetProject } from "./Planet";
import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Sun3D from "./Sun3D";
import Planet3D from "./Planet3D";
import Orbit3D from "./Orbit3D";
import Stars3D from "./Stars3D";
import MeteorCursor from "./MeteorCursor";

interface SolarSystemProps {
  selectedProject: PlanetProject | null;
  setSelectedProject: (project: PlanetProject | null) => void;
}

// Sample projects data
const projects: PlanetProject[] = [
  {
    id: "1",
    title: "Human-AI interaction",
    description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include real-time inventory management, user authentication, and a responsive checkout flow.",
    stack: ["React", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
    completionPercent: 75,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "200 65% 55%",
    orbitIndex: 1,
    planetSize: 0.4,
    planetImage: 1,
    texture: "/textures/mercury.png",
    orbitSpeed: 0.8,
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A collaborative project management tool with drag-and-drop functionality, real-time updates via WebSockets, and team collaboration features.",
    stack: ["TypeScript", "Next.js", "Prisma", "Socket.io", "shadcn/ui"],
    completionPercent: 32,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "280 70% 60%",
    orbitIndex: 2,
    planetSize: 0.7,
    planetImage: 2,
    texture: "/textures/venus.png",
    orbitSpeed: 0.6,
  },
  {
    id: "3",
    title: "AI Content Generator",
    description: "An AI-powered content creation tool leveraging GPT-4 for blog posts, social media, and marketing copy. Includes templates and tone customization.",
    stack: ["React", "OpenAI API", "Firebase", "Framer Motion"],
    completionPercent: 68,
    links: {
      github: "https://github.com",
    },
    accentColor: "140 70% 50%",
    orbitIndex: 3,
    planetSize: 0.75,
    planetImage: 3,
    texture: "/textures/earth.png",
    orbitSpeed: 0.4,
  },
  {
    id: "4",
    title: "Weather Dashboard",
    description: "A beautiful weather forecasting dashboard with interactive maps, hourly predictions, and location-based alerts. Built with modern design patterns.",
    stack: ["Vue.js", "D3.js", "OpenWeather API", "CSS Grid"],
    completionPercent: 50,
    links: {
      github: "https://github.com",
      live: "https://example.com",
    },
    accentColor: "15 65% 55%",
    orbitIndex: 4,
    planetSize: 0.5,
    planetImage: 1,
    texture: "/textures/mars.png",
    orbitSpeed: 0.3,
  },
  {
    id: "5",
    title: "Portfolio Analytics",
    description: "Real-time analytics dashboard for tracking portfolio performance, visitor insights, and engagement metrics with beautiful data visualizations.",
    stack: ["React", "Chart.js", "Express", "MongoDB", "AWS"],
    completionPercent: 75,
    links: {
      github: "https://github.com",
    },
    accentColor: "260 75% 65%",
    orbitIndex: 5,
    planetSize: 1.2,
    planetImage: 2,
    texture: "/textures/jupiter.png",
    orbitSpeed: 0.15,
  },
];

const SolarSystem = ({ selectedProject, setSelectedProject }: SolarSystemProps) => {
  return (
    <section className="absolute inset-0 w-full h-full bg-black">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 20, 25]} fov={45} />
          <OrbitControls
            enableZoom={true}
            minDistance={10}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2} // Prevent going below the plane
            enablePan={true}
          />

          <ambientLight intensity={0.2} />
          <Stars3D />
          <Sun3D />

          {projects.map((project) => {
            const orbitRadius = 5 + project.orbitIndex * 3; // Calculate orbit radius
            return (
              <group key={project.id}>
                <Orbit3D radius={orbitRadius} />
                <Planet3D
                  project={project}
                  texturePath={project.texture || "/textures/earth.png"}
                  radius={orbitRadius}
                  size={project.planetSize}
                  speed={project.orbitSpeed || 0.5}
                  orbitOffset={project.orbitIndex * 2} // Stagger starting positions
                  isSelected={selectedProject?.id === project.id}
                  onSelect={setSelectedProject}
                />
              </group>
            );
          })}
        </Suspense>
      </Canvas>

      {/* Meteor Cursor Overlay */}
      <MeteorCursor />
    </section>
  );
};

export default SolarSystem;
