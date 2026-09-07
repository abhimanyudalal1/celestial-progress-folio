import type { PlanetProject } from "@/components/Planet";
import type { PlanetType } from "@/lib/planet-sprites";

/**
 * THE PATH
 * ========
 * The solar system is a career path, not a project gallery. Distance from the sun
 * is time: the innermost body is the earliest milestone, the outermost is now. Every
 * body is a milestone — some are things built (`build`), some are places worked
 * (`role`) — and `ledTo` links each to what it caused, which is what makes the tour
 * read as a story rather than a list.
 *
 * Two tiers:
 *   - `stop`  — a planet. The camera halts, a full card opens. Costs one spritesheet
 *               pair, and only five dark sheets exist (see lib/planet-sprites), so
 *               five is the ceiling without new art.
 *   - `flyby` — a minor body passed *during* transit. Label only, no dwell, no sprite.
 *               These exist to give the otherwise-dead time between stops something
 *               to carry.
 *
 * Ordering is derived from `start`, never from array position — reorder freely.
 */

export type MilestoneKind = "build" | "role";
export type MilestoneTier = "stop" | "flyby";

export interface Milestone {
  id: string;
  kind: MilestoneKind;
  tier: MilestoneTier;
  /** Project name, or the organisation for a role. */
  title: string;
  /** Roles only — the position held. Rendered as a subhead under `title`. */
  role?: string;
  /** "YYYY-MM". Sole source of ordering. */
  start: string;
  /** "YYYY-MM", or null for present. */
  end: string | null;
  description: string;
  stack: string[];
  links?: { github?: string; live?: string };
  /** id of the milestone this one caused. Rendered as the card's closing line. */
  ledTo?: string;
  /** HSL triplet, consumed as `hsl(${accentColor})`. */
  accentColor: string;
  /** Stops only. Which spritesheet pair the planet renders with. */
  planetType?: PlanetType;
  /** Stops only. Fraction of the base viewport dimension. */
  planetSize?: number;
}

/**
 * ⚠️ PLACEHOLDER CONTENT — the shape is real, most of the facts are not.
 *
 * Confirmed from the codebase: the IIT Bombay internship, and the three real
 * projects. Everything marked TODO below is a guess and must be replaced before
 * this ships — especially every `start`/`end`, which drives the entire ordering
 * of the path, and every `ledTo`, which is the causal chain.
 */
export const milestones: Milestone[] = [
  {
    id: "startup",
    kind: "role",
    tier: "flyby",
    title: "TODO — startup name",
    role: "TODO — role held",
    start: "2022-06", // TODO
    end: "2022-08", // TODO
    description: "TODO — one line. Flyby copy is a single sentence; it passes quickly.",
    stack: [],
    ledTo: "indus",
    accentColor: "38 95% 50%",
  },
  {
    id: "indus",
    kind: "build",
    tier: "stop",
    title: "The_Indus_Project",
    start: "2023-01", // TODO
    end: "2023-06", // TODO
    description:
      "Hydrological modeling of the Indus river basin using physically-based statistical approaches, predicting runoff from meteorological and remote sensing data.",
    stack: ["Python", "ArcGIS", "QGIS", "ArcPy", "Hydrological Modeling"],
    links: { github: "https://github.com/abhimanyudalal1" },
    ledTo: "iitb", // the user confirmed this causal link
    accentColor: "160 70% 45%",
    planetType: "terran",
    planetSize: 0.085,
  },
  {
    id: "panasonic",
    kind: "role",
    tier: "flyby",
    title: "Panasonic",
    role: "TODO — role held",
    start: "2023-08", // TODO
    end: "2023-12", // TODO
    description: "TODO — one line.",
    stack: [],
    ledTo: "iitb",
    accentColor: "198 90% 60%",
  },
  {
    id: "iitb",
    kind: "role",
    tier: "stop",
    title: "IIT Bombay",
    role: "Research Intern", // TODO — confirm exact title
    start: "2024-05", // TODO
    end: "2024-07", // TODO
    description: "TODO — what you worked on and what came of it.",
    stack: [], // TODO
    ledTo: "rehearso",
    accentColor: "0 85% 60%",
    planetType: "lava",
    planetSize: 0.1,
  },
  {
    id: "rehearso",
    kind: "build",
    tier: "stop",
    title: "Human-AI Interaction",
    start: "2024-09", // TODO
    end: "2025-02", // TODO
    description:
      "An AI-powered web platform that helps users improve their public speaking through solo and group sessions — real-time coaching, AI analysis, peer evaluation and post-session feedback on voice clarity, confidence, gestures and body language.",
    stack: ["React", "Node.js", "PostgreSQL", "OpenCV", "TensorFlow"],
    links: {
      github: "https://github.com/abhimanyudalal1/rehearso.ai",
      live: "https://rehearso.ai",
    },
    ledTo: "ceew",
    accentColor: "32 85% 45%",
    planetType: "cracked",
    planetSize: 0.115,
  },
  {
    id: "ceew",
    kind: "role",
    tier: "stop",
    title: "CEEW",
    role: "TODO — role held",
    start: "2025-03", // TODO
    end: null, // TODO — null renders as "Present"
    description: "TODO — what you work on and what it has led to.",
    stack: [], // TODO
    ledTo: "peekpeak",
    accentColor: "38 95% 50%",
    planetType: "ringed",
    planetSize: 0.135,
  },
  {
    id: "peekpeak",
    kind: "build",
    tier: "stop",
    title: "peekPeak",
    start: "2025-06", // TODO
    end: null,
    description:
      "A Chrome extension that solves context drift while reading, researching or studying with LLMs — an AI-powered contextual glossary for anything on the web, giving instant micro-explanations as persistent annotations without derailing your workflow.",
    stack: ["React", "OpenAI API", "Firebase", "Framer Motion", "TailwindCSS"],
    links: { github: "https://github.com/abhimanyudalal1" },
    accentColor: "198 90% 60%",
    planetType: "ice",
    planetSize: 0.16,
  },
];

/** Chronological order. Everything downstream derives from this, not array position. */
export const orderedMilestones: Milestone[] = [...milestones].sort((a, b) =>
  a.start.localeCompare(b.start)
);

/** The bodies the camera actually halts at, innermost (earliest) first. */
export const stops: Milestone[] = orderedMilestones.filter((m) => m.tier === "stop");

/**
 * A flyby, resolved to where it sits on the path. `afterStop` is the index of the
 * last stop preceding it (-1 if it comes before the first stop); `slot` spreads
 * multiple flybys sharing one gap so they never land on top of each other.
 */
export interface ResolvedFlyby {
  milestone: Milestone;
  afterStop: number;
  slot: number;
}

export const flybys: ResolvedFlyby[] = (() => {
  const gaps = new Map<number, Milestone[]>();

  for (const m of orderedMilestones) {
    if (m.tier !== "flyby") continue;
    // How many stops precede this flyby chronologically?
    const afterStop = stops.filter((s) => s.start.localeCompare(m.start) < 0).length - 1;
    const bucket = gaps.get(afterStop);
    if (bucket) bucket.push(m);
    else gaps.set(afterStop, [m]);
  }

  const resolved: ResolvedFlyby[] = [];
  for (const [afterStop, group] of gaps) {
    group.forEach((milestone, i) => {
      resolved.push({ milestone, afterStop, slot: (i + 1) / (group.length + 1) });
    });
  }
  return resolved;
})();

const byId = new Map(milestones.map((m) => [m.id, m]));

/** The milestone this one caused, if any. */
export const getLedTo = (m: Milestone): Milestone | undefined =>
  m.ledTo ? byId.get(m.ledTo) : undefined;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-05" → "May 2024". Tolerates a bare year or a malformed value. */
export const formatMonth = (value: string): string => {
  const [year, month] = value.split("-");
  const idx = Number(month) - 1;
  return MONTHS[idx] ? `${MONTHS[idx]} ${year}` : year;
};

/** "May 2024 — Jul 2024", or "Mar 2025 — Present". */
export const formatRange = (m: Milestone): string =>
  `${formatMonth(m.start)} — ${m.end ? formatMonth(m.end) : "Present"}`;

/** Year label for the transit readout. */
export const yearOf = (m: Milestone): string => m.start.split("-")[0];

/**
 * Adapts the stops to the shape the solar system renderer expects. `orbitIndex` is
 * 1-based position along the path, so orbit radius grows with time.
 */
export const toPlanetProjects = (): PlanetProject[] =>
  stops.map((m, index) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    stack: m.stack,
    completionPercent: 100,
    links: { github: m.links?.github, live: m.links?.live },
    accentColor: m.accentColor,
    orbitIndex: index + 1,
    planetSize: m.planetSize ?? 0.07,
    planetImage: index + 1,
    planetType: m.planetType,
  }));

export default milestones;
