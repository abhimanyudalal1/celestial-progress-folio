/**
 * Planet spritesheet lookup — the single source of truth for planet art, shared by
 * the desktop solar system, the mobile tour and the grid view. Sheets are 50 columns
 * x 3 rows = 150 frames, each frame a square the size of the rendered planet.
 *
 * Keyed by planet *type* rather than by milestone id: the id-keyed version only
 * understood "1".."5" and silently fell through to a flat circle for anything else.
 *
 * NOTE: dark-mode sheets are the binding constraint on how many bodies the path can
 * carry. There are more light sheets in public/ (Galaxy, Star, Gas giant 2 light) but
 * only these five have a dark counterpart, so five planet stops is the ceiling
 * without new art. Flyby milestones deliberately need no sprite.
 */

export const SPRITE_COLS = 50;
export const SPRITE_ROWS = 3;
export const SPRITE_FRAMES = SPRITE_COLS * SPRITE_ROWS;

export const PLANET_SHEETS = {
  lava: {
    light: "/Lava%20World%20-%201909546053%20-%20spritesheet.png",
    dark: "/Islands%20-%20330873532%20-%20spritesheetdark.png",
  },
  cracked: {
    light: "/Gas%20giant%201%20-%203542928846%20-%20spritesheet.png",
    dark: "/Gas%20giant%202%20-%20330873532%20-%20spritesheetdark.png",
  },
  terran: {
    light: "/Terran%20Wet%20-%203542928846%20-%20spritesheet.png",
    dark: "/Terran%20Wet%20-%20330873532%20-%20spritesheetdark.png",
  },
  ringed: {
    light: "/Terran%20Dry%20-%203542928846%20-%20spritesheet.png",
    dark: "/Terran%20Dry%20-%20330873532%20-%20spritesheetdark.png",
  },
  ice: {
    light: "/Ice%20World%20-%201909546053%20-%20spritesheet.png",
    dark: "/Ice%20World%20-%20330873532%20-%20spritesheetdark.png",
  },
} as const;

/**
 * The sun. Same 50x3 flipbook layout as the planets — these sheets were already in
 * public/ (and the light one was already being preloaded), so the star renders as
 * real animated art rather than the procedural radial gradient it used to be.
 */
export const SUN_SHEET = {
  light: "/Star_dark%20-%202548694337%20-%20spritesheet.png",
  dark: "/Star%20-%20330873532%20-%20spritesheetdark.png",
} as const;

export type PlanetType = keyof typeof PLANET_SHEETS;

export const PLANET_TYPES = Object.keys(PLANET_SHEETS) as PlanetType[];

/** Spritesheet URL for a planet type, or undefined if the type is unknown. */
export const getSpriteByType = (
  type: string | undefined,
  isDarkMode: boolean
): string | undefined => {
  const sheet = PLANET_SHEETS[type as PlanetType];
  if (!sheet) return undefined;
  return isDarkMode ? sheet.dark : sheet.light;
};

/**
 * Background offset for a given frame, so every consumer steps the flipbook the
 * same way. `size` is the rendered edge length of the planet in px.
 */
export const getSpriteOffset = (frame: number, size: number): string =>
  `${-(frame % SPRITE_COLS) * size}px ${-Math.floor(frame / SPRITE_COLS) * size}px`;

/** Full background-size for a sheet rendered at `size` px per frame. */
export const getSpriteSheetSize = (size: number): string =>
  `${size * SPRITE_COLS}px ${size * SPRITE_ROWS}px`;
