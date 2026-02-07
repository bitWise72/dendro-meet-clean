import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Text, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface DataFace {
  label: string;
  value: number;
  color?: string;
}

interface DataCubeProps {
  data?: DataFace[];
  size?: number;
  autoRotate?: boolean;
  rotation?: [number, number, number];
}

const DEFAULT_DATA: DataFace[] = [
  { label: "Front", value: 85, color: "#22c55e" },
  { label: "Back", value: 72, color: "#3b82f6" },
  { label: "Left", value: 91, color: "#8b5cf6" },
  { label: "Right", value: 68, color: "#f59e0b" },
  { label: "Top", value: 95, color: "#ec4899" },
  { label: "Bottom", value: 54, color: "#06b6d4" },
];

function CubeFace({
  position,
  rotation,
  data,
  size,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  data: DataFace;
  size: number;
}) {
  const faceRef = useRef<THREE.Group>(null);

  return (
    <group position={position} rotation={rotation} ref={faceRef}>
      {/* Face background */}
      <mesh>
        <planeGeometry args={[size * 0.9, size * 0.9]} />
        <meshStandardMaterial
          color={data.color || "#22c55e"}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Progress bar */}
      <mesh position={[0, -size * 0.2, 0.01]}>
        <planeGeometry args={[size * 0.7, size * 0.08]} />
        <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-(size * 0.35) + (size * 0.7 * data.value / 100) / 2, -size * 0.2, 0.02]}>
        <planeGeometry args={[size * 0.7 * (data.value / 100), size * 0.06]} />
        <meshStandardMaterial
          color={data.color || "#22c55e"}
          emissive={data.color || "#22c55e"}
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, size * 0.15, 0.01]}
        fontSize={size * 0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.label}
      </Text>

      {/* Value */}
      <Text
        position={[0, -size * 0.05, 0.01]}
        fontSize={size * 0.18}
        color={data.color || "#22c55e"}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {data.value}%
      </Text>
    </group>
  );
}

export function DataCube({
  data = DEFAULT_DATA,
  size = 1.5,
  autoRotate = false,
  rotation,
}: DataCubeProps) {
  const cubeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cubeRef.current) {
      if (rotation) {
        cubeRef.current.rotation.set(...rotation);
      } else if (autoRotate) {
        cubeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
        cubeRef.current.rotation.y += 0.005;
      }
    }
  });

  const facePositions: Array<{
    position: [number, number, number];
    rotation: [number, number, number];
    index: number;
  }> = useMemo(
    () => [
      { position: [0, 0, size / 2], rotation: [0, 0, 0], index: 0 }, // Front
      { position: [0, 0, -size / 2], rotation: [0, Math.PI, 0], index: 1 }, // Back
      { position: [-size / 2, 0, 0], rotation: [0, -Math.PI / 2, 0], index: 2 }, // Left
      { position: [size / 2, 0, 0], rotation: [0, Math.PI / 2, 0], index: 3 }, // Right
      { position: [0, size / 2, 0], rotation: [-Math.PI / 2, 0, 0], index: 4 }, // Top
      { position: [0, -size / 2, 0], rotation: [Math.PI / 2, 0, 0], index: 5 }, // Bottom
    ],
    [size]
  );

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} />

      <group ref={cubeRef}>
        {/* Wireframe cube */}
        <Box args={[size, size, size]}>
          <meshBasicMaterial wireframe color="#22c55e" opacity={0.3} transparent />
        </Box>

        {/* Data faces */}
        {facePositions.map((face, i) => (
          <CubeFace
            key={i}
            position={face.position}
            rotation={face.rotation}
            data={data[face.index] || DEFAULT_DATA[face.index]}
            size={size}
          />
        ))}
      </group>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        autoRotate={autoRotate}
        autoRotateSpeed={0.3}
      />
    </>
  );
}

export default DataCube;
