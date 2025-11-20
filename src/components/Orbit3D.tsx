import { Mesh } from "three";

interface Orbit3DProps {
    radius: number;
}

const Orbit3D = ({ radius }: Orbit3DProps) => {
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[-7, 0, 0]}>
            <ringGeometry args={[radius - 0.05, radius + 0.05, 128]} />
            <meshBasicMaterial color="white" transparent opacity={0.1} side={2} />
        </mesh>
    );
};

export default Orbit3D;
