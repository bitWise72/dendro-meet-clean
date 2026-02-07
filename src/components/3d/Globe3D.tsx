import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface GlobeMarker {
  lat: number;
  lng: number;
  label: string;
  color?: string;
}

interface Globe3DProps {
  markers?: GlobeMarker[];
  autoRotate?: boolean;
  onMarkerClick?: (marker: GlobeMarker) => void;
}

// Convert lat/lng to 3D position on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function GlobeMarkerPoint({
  marker,
  radius,
  onClick
}: {
  marker: GlobeMarker;
  radius: number;
  onClick?: () => void;
}) {
  const position = useMemo(
    () => latLngToVector3(marker.lat, marker.lng, radius + 0.02),
    [marker.lat, marker.lng, radius]
  );

  const markerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      );
    }
  });

  return (
    <group position={position}>
      <mesh ref={markerRef} onClick={onClick}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={marker.color || "#22c55e"}
          emissive={marker.color || "#22c55e"}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Html
        position={[0, 0.08, 0]}
        center
        distanceFactor={3}
        style={{ pointerEvents: "none" }}
      >
        <div className="bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-foreground whitespace-nowrap border border-border shadow-lg">
          {marker.label}
        </div>
      </Html>
    </group>
  );
}

export function Globe3D({
  markers = [],
  autoRotate = false,
  onMarkerClick
}: Globe3DProps) {
  const globeRef = useRef<THREE.Group>(null);
  const radius = 1;

  useFrame(() => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  // Create wireframe sphere geometry
  const wireframeGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(radius, 2);
    return new THREE.EdgesGeometry(geo);
  }, [radius]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      <group ref={globeRef}>
        {/* Main globe sphere */}
        <Sphere args={[radius, 64, 64]}>
          <meshStandardMaterial
            color="#0a0a0a"
            transparent
            opacity={0.9}
            roughness={0.8}
            metalness={0.2}
          />
        </Sphere>

        {/* Wireframe overlay */}
        <lineSegments geometry={wireframeGeometry}>
          <lineBasicMaterial color="#22c55e" transparent opacity={0.15} />
        </lineSegments>

        {/* Atmospheric glow */}
        <Sphere args={[radius * 1.05, 32, 32]}>
          <meshBasicMaterial
            color="#22c55e"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Markers */}
        {markers.map((marker, index) => (
          <GlobeMarkerPoint
            key={`${marker.label}-${index}`}
            marker={marker}
            radius={radius}
            onClick={() => onMarkerClick?.(marker)}
          />
        ))}
      </group>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default Globe3D;
