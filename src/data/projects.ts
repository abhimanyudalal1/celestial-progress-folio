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
    title: "AI Content Generator",
    description: "An AI-powered content creation tool leveraging GPT-4 for blog posts, social media, and marketing copy. Includes templates, tone customization, and multi-language support.",
    techStack: ["React", "OpenAI API", "Firebase", "Framer Motion", "TailwindCSS"],
    themeColor: PLANET_THEMES.terran,
    planetType: 'terran',
    completionPercent: 68,
    links: {
      github: "https://github.com/abhimanyudalal1",
    },
  },
  {
    id: "4",
    title: "Weather Dashboard",
    description: "A beautiful weather forecasting dashboard with interactive maps, hourly predictions, and location-based alerts. Features real-time data visualization and Saturn-inspired design.",
    techStack: ["Vue.js", "D3.js", "OpenWeather API", "MapboxGL", "CSS Grid"],
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
