import { PlanetProject } from '@/components/Planet';

// Extended interface for themed projects
export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  themeColor: string; // Hex color
  planetType: 'lava' | 'cracked' | 'terran' | 'ringed' | 'ice';
  links: {
    demo?: string;
    github?: string;
  };
  completionPercent: number;
}

// Planet theme colors mapped to each project
export const PLANET_THEMES = {
  lava: '#EF4444',      // Magma Red/Orange
  cracked: '#D97706',   // Bronze/Amber  
  terran: '#10B981',    // Emerald/Forest Green
  ringed: '#F59E0B',    // Golden Yellow
  ice: '#38BDF8',       // Cyan/Ice Blue
} as const;

export const projects: Project[] = [
  {
    id: "1",
    title: "Human-AI Interaction",
    description: "An AI-powered web platform that helps users improve their public speaking skills through solo and group sessions. It provides real-time coaching, AI analysis, peer evaluation, and post-session feedback focused on voice clarity, confidence, gestures, and body language.",
    techStack: ["React", "Node.js", "PostgreSQL", "OpenCV", "TensorFlow"],
    themeColor: PLANET_THEMES.lava,
    planetType: 'lava',
    completionPercent: 85,
    links: {
      github: "https://github.com/abhimanyudalal1/rehearso.ai",
      demo: "https://rehearso.ai",
    },
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A collaborative project management tool with drag-and-drop functionality, real-time updates via WebSockets, and team collaboration features. Built for high-performance teams.",
    techStack: ["TypeScript", "Next.js", "Prisma", "Socket.io", "shadcn/ui"],
    themeColor: PLANET_THEMES.cracked,
    planetType: 'cracked',
    completionPercent: 75,
    links: {
      github: "https://github.com/abhimanyudalal1",
      demo: "https://example.com",
    },
  },
  {
    id: "3",
    title: "The_Indus_Project",
    description: "This project focuses on hydrological modeling of the Indus river basin (or specific sub-basins) using physically-based statistical approaches. The goal is to predict runoff based on meteorological and remote sensing data.",
    techStack: ["Python", "ArcGIS", "QGIS", "ArcPy", "Hydrological Modeling"],
    themeColor: PLANET_THEMES.terran,
    planetType: 'terran',
    completionPercent: 68,
    links: {
      github: "https://github.com/abhimanyudalal1",
    },
  },
  {
    id: "4",
    title: "peekPeak",
    description: "peekPeak is a powerful Chrome extension designed to solve Context Drift and Cognitive Breakage while reading, researching, or studying with LLMs. It acts as an AI-powered contextual glossary for anything on the web, giving you instant micro-explanations as persistent web annotations without derailing your main workflow.",
    techStack: ["React", "OpenAI API", "Firebase", "Framer Motion", "TailwindCSS"],
    themeColor: PLANET_THEMES.ringed,
    planetType: 'ringed',
    completionPercent: 50,
    links: {
      github: "https://github.com/abhimanyudalal1",
      demo: "https://example.com",
    },
  },
  {
    id: "5",
    title: "Portfolio Analytics",
    description: "Real-time analytics dashboard for tracking portfolio performance, visitor insights, and engagement metrics with beautiful data visualizations and ML-powered insights.",
    techStack: ["React", "D3.js", "Express", "MongoDB", "AWS Lambda"],
    themeColor: PLANET_THEMES.ice,
    planetType: 'ice',
    completionPercent: 75,
    links: {
      github: "https://github.com/abhimanyudalal1",
    },
  },
];

// Legacy support - convert to PlanetProject format for SolarSystem
export const toLegacyProjects = (): PlanetProject[] => {
  const accentColors: Record<string, string> = {
    lava: "0 85% 60%",
    cracked: "32 85% 45%",
    terran: "160 70% 45%",
    ringed: "38 95% 50%",
    ice: "198 90% 60%",
  };

  return projects.map((p, index) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    stack: p.techStack,
    completionPercent: p.completionPercent,
    links: {
      github: p.links.github,
      live: p.links.demo,
    },
    accentColor: accentColors[p.planetType],
    orbitIndex: index + 1,
    planetSize: [0.08, 0.09, 0.105, 0.215, 0.11][index],
    planetImage: index + 1,
  }));
};

export default projects;
