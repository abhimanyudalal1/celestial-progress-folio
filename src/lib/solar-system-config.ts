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
 * Calculates orbit radii based on the base dimension (min(width, height))
 */
export const getOrbitRadii = (baseDimension: number) => {
    const baseRadius = baseDimension * 0.4;
    return {
        r1: baseRadius * 2.0,
        r2: baseRadius * 3.0,
        r3: baseRadius * 4.0,
        r4: baseRadius * 5.0,
        r5: baseRadius * 6.0,
    };
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
