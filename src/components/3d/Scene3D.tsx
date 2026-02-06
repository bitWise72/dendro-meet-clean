import { ReactNode, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader2 } from "lucide-react";

interface Scene3DProps {
  children: ReactNode;
  className?: string;
  overlay?: boolean;
}

export function Scene3D({ children, className, overlay = false }: Scene3DProps) {
  return (
    <div className={className} style={{ position: overlay ? "absolute" : "relative", inset: overlay ? 0 : undefined }}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }
      >
        <Canvas
          gl={{ 
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ 
            background: "transparent",
            pointerEvents: overlay ? "none" : "auto",
          }}
          dpr={[1, 2]}
        >
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}

export default Scene3D;
