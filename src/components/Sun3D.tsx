import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Mesh } from "three";

const Sun3D = () => {
    const meshRef = useRef<Mesh>(null);
    const sunTexture = useLoader(TextureLoader, "/textures/sun.png");

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
        }
    });

    return (
        <mesh ref={meshRef} position={[-7, 0, 0]}> {/* Positioned to the left like original */}
            <sphereGeometry args={[2.5, 64, 64]} /> {/* Large size */}
            <meshStandardMaterial
                map={sunTexture}
                emissiveMap={sunTexture}
                emissive="orange"
                emissiveIntensity={2}
                toneMapped={false}
            />
            <pointLight intensity={50} distance={100} decay={1} color="#ffaa00" />
        </mesh>
    );
};

export default Sun3D;
