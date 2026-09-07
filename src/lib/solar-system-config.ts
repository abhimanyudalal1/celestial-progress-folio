/**
 * Shared configuration for the Solar System to ensure
 * the TransitionController overlay matches the Hero component exactly.
 */

export const SOLAR_CONFIG = {
    viewBoxWidth: 3000,
    viewBoxHeight: 1000,
    viewBoxLeft: -800,
    sunCenterX: -700,
    sunCenterY: 500,
};

/**
 * Calculate planet position on an elliptical orbit
 */
export const getPlanetPosition = (
    radiusX: number,
    radiusY: number,
    sunCenterX: number,
    sunCenterY: number,
    angleDeg: number
): { x: number; y: number } => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = sunCenterX + radiusX * Math.cos(angleRad);
    const y = sunCenterY + radiusY * Math.sin(angleRad);
    return { x, y };
};

/**
 * Radius of a single orbit. `orbitIndex` is 1-based, matching `project.orbitIndex`.
 * Each orbit sits one step further out than the last, which is what makes distance
 * from the sun readable as time along the career path.
 */
export const getOrbitRadius = (orbitIndex: number, baseDimension: number): number =>
    baseDimension * 0.4 * (orbitIndex + 1);

/**
 * Calculates orbit radii based on the base dimension (min(width, height)).
 * Callers index this as `r${orbitIndex}`, so it is built out past any realistic
 * milestone count — the old hardcoded r1..r5 returned undefined for a 6th body.
 */
export const getOrbitRadii = (baseDimension: number, count = 12): Record<string, number> => {
    const radii: Record<string, number> = {};
    for (let i = 1; i <= count; i++) {
        radii[`r${i}`] = getOrbitRadius(i, baseDimension);
    }
    return radii;
};

/**
 * Helper to get angle for a specific planet index
 */
export const getPlanetAngle = (orbitIndex: number) => {
    const baseAngle = 300;
    const angleStep = 21;

    if (orbitIndex === 1) {
        return 298;
    }
    return (baseAngle + (orbitIndex - 1) * angleStep) % 360;
};
