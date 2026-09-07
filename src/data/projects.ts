import { PlanetProject } from '@/components/Planet';
import { toPlanetProjects } from '@/data/milestones';

/**
 * Standalone project list, used by the grid/card views (/grid-view, ProjectsGrid).
 *
 * The *solar system* no longer reads from here — it renders the career path in
 * `data/milestones.ts`, where projects and roles sit together as milestones. This
 * file is only the project-shaped view of the same work, for surfaces that show
 * projects alone. Keep the `id`s in sync with the milestone ids.
 */

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
    id: "indus",
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
    id: "rehearso",
    title: "Human-AI Interaction",
    description: "An AI-powered web platform that helps users improve their public speaking skills through solo and group sessions. It provides real-time coaching, AI analysis, peer evaluation, and post-session feedback focused on voice clarity, confidence, gestures, and body language.",
    techStack: ["React", "Node.js", "PostgreSQL", "OpenCV", "TensorFlow"],
    themeColor: PLANET_THEMES.cracked,
    planetType: 'cracked',
    completionPercent: 85,
    links: {
      github: "https://github.com/abhimanyudalal1/rehearso.ai",
      demo: "https://rehearso.ai",
    },
  },
  {
    id: "peekpeak",
    title: "peekPeak",
    description: "peekPeak is a powerful Chrome extension designed to solve Context Drift and Cognitive Breakage while reading, researching, or studying with LLMs. It acts as an AI-powered contextual glossary for anything on the web, giving you instant micro-explanations as persistent web annotations without derailing your main workflow.",
    techStack: ["React", "OpenAI API", "Firebase", "Framer Motion", "TailwindCSS"],
    themeColor: PLANET_THEMES.ice,
    planetType: 'ice',
    completionPercent: 50,
    links: {
      github: "https://github.com/abhimanyudalal1",
    },
  },
];

/**
 * The bodies rendered by the solar system. Delegates to the career path, so the
 * orrery shows milestones (projects *and* roles) rather than projects alone.
 */
export const toLegacyProjects = (): PlanetProject[] => toPlanetProjects();

export default projects;
