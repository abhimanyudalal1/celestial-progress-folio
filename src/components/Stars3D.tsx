import { useLoader } from "@react-three/fiber";
import { TextureLoader, BackSide } from "three";

const Stars3D = () => {
    const texture = useLoader(TextureLoader, "/textures/stars.png");

    return (
        <mesh>
            <sphereGeometry args={[500, 64, 64]} />
            <meshBasicMaterial map={texture} side={BackSide} />
        </mesh>
    );
};

export default Stars3D;
