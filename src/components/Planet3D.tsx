import { useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Mesh, Group } from "three";
import { Html } from "@react-three/drei";
import { PlanetProject } from "./Planet";

interface Planet3DProps {
    project: PlanetProject;
    texturePath: string;
    radius: number; // Orbit radius
    size: number; // Planet size
    speed: number; // Orbit speed
    orbitOffset: number; // Initial angle offset
    isSelected: boolean;
    onSelect: (project: PlanetProject) => void;
}

const Planet3D = ({
    project,
    texturePath,
    radius,
    size,
    speed,
    orbitOffset,
    isSelected,
    onSelect,
}: Planet3DProps) => {
    const meshRef = useRef<Mesh>(null);
    const groupRef = useRef<Group>(null);
    const texture = useLoader(TextureLoader, texturePath);
    const [hovered, setHovered] = useState(false);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * speed * 0.1 + orbitOffset;
        const x = Math.cos(t) * radius - 7; // Offset by sun position (-7)
        const z = Math.sin(t) * radius; // Use Z for depth in 3D

        if (groupRef.current) {
            groupRef.current.position.x = x;
            groupRef.current.position.z = z;
        }

        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh
                ref={meshRef}
                onClick={() => onSelect(project)}
                onPointerOver={() => {
                    document.body.style.cursor = "pointer";
                    setHovered(true);
                }}
                onPointerOut={() => {
                    document.body.style.cursor = "auto";
                    setHovered(false);
                }}
            >
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial map={texture} />
                {isSelected && (
                    <meshBasicMaterial color="white" wireframe transparent opacity={0.2} />
                )}
            </mesh>

            {/* Selection Ring */}
            {isSelected && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[size * 1.2, size * 1.3, 32]} />
                    <meshBasicMaterial color="white" side={2} transparent opacity={0.5} />
                </mesh>
            )}

            <Html position={[0, size + 0.5, 0]} center distanceFactor={15}>
                <div
                    className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-opacity duration-300 ${hovered || isSelected ? "opacity-100 bg-black/80 text-white" : "opacity-0"
                        }`}
                    style={{ pointerEvents: "none" }}
                >
                    {project.title}
                </div>
            </Html>
        </group>
    );
};

export default Planet3D;
