/**
 * Planet spritesheet lookup, shared by the desktop solar system and the
 * mobile tour. Sheets are 50 columns x 3 rows = 150 frames, each frame a
 * square the size of the rendered planet.
 */

export const SPRITE_COLS = 50;
export const SPRITE_ROWS = 3;
export const SPRITE_FRAMES = 150;

const LIGHT_SPRITES: Record<string, string> = {
  "1": "/Lava%20World%20-%201909546053%20-%20spritesheet.png",
  "2": "/Gas%20giant%201%20-%203542928846%20-%20spritesheet.png",
  "3": "/Terran%20Wet%20-%203542928846%20-%20spritesheet.png",
  "4": "/Terran%20Dry%20-%203542928846%20-%20spritesheet.png",
  "5": "/Ice%20World%20-%201909546053%20-%20spritesheet.png",
};

const DARK_SPRITES: Record<string, string> = {
  "1": "/Islands%20-%20330873532%20-%20spritesheetdark.png",
  "2": "/Gas%20giant%202%20-%20330873532%20-%20spritesheetdark.png",
  "3": "/Terran%20Wet%20-%20330873532%20-%20spritesheetdark.png",
  "4": "/Terran%20Dry%20-%20330873532%20-%20spritesheetdark.png",
  "5": "/Ice%20World%20-%20330873532%20-%20spritesheetdark.png",
};

export const getPlanetSprite = (projectId: string, isDarkMode: boolean): string | undefined =>
  (isDarkMode ? DARK_SPRITES : LIGHT_SPRITES)[projectId];
