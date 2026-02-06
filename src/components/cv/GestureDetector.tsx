import { useEffect, useRef, useState, useCallback } from "react";
import { Hands, Results, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import { Maximize2, Hand, Zap, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface GestureDetectorProps {
    onGesture?: (gesture: string, data: any) => void;
    showDebug?: boolean;
}

export function GestureDetector({ onGesture, showDebug = false }: GestureDetectorProps) {
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastGestureRef = useRef<string | null>(null);
    const lastDistanceRef = useRef<number | null>(null);

    const onResults = useCallback((results: Results) => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvasCtx = canvasRef.current.getContext("2d");
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw landmarks if in debug mode
        if (showDebug && results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#10b981', lineWidth: 5 });
                drawLandmarks(canvasCtx, landmarks, { color: '#34d399', lineWidth: 2 });
            }
        }

        // Gesture Logic
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // 1. Pinch Detection (Thumb 4 & Index 8)
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            const distance = Math.sqrt(
                Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
            );

            const IS_PINCHING = distance < 0.05;

            if (IS_PINCHING) {
                if (lastDistanceRef.current !== null) {
                    const delta = distance - lastDistanceRef.current;
                    onGesture?.("pinch", { distance, delta, x: indexTip.x, y: indexTip.y });
                }
                lastDistanceRef.current = distance;
                lastGestureRef.current = "pinching";
            } else {
                lastDistanceRef.current = null;

                // 2. Pointing Detection (Index extended, others folded)
                // Very simplified: distance between tips of other fingers and palm
                const isPoint = indexTip.y < landmarks[6].y &&
                    landmarks[12].y > landmarks[10].y &&
                    landmarks[16].y > landmarks[14].y;

                if (isPoint) {
                    onGesture?.("point", { x: indexTip.x, y: indexTip.y });
                }
            }
        }

        canvasCtx.restore();
    }, [onGesture, showDebug]);

    useEffect(() => {
        if (!isActive) return;

        let camera: Camera | null = null;
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);

        if (videoRef.current) {
            camera = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (videoRef.current) await hands.send({ image: videoRef.current });
                },
                width: 640,
                height: 480,
            });
            camera.start().catch(err => {
                console.error("Camera failed:", err);
                setError("Camera Access Denied");
                setIsActive(false);
            });
        }

        return () => {
            camera?.stop();
            hands.close();
        };
    }, [isActive, onResults]);

    return (
        <div className="relative group">
            <button
                onClick={() => setIsActive(!isActive)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                    isActive
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20"
                )}
            >
                {isActive ? <Hand className="h-3.5 w-3.5 animate-pulse" /> : <Hand className="h-3.5 w-3.5" />}
                <span className="text-xs font-bold uppercase tracking-wider">{isActive ? "CV Active" : "Enable CV"}</span>
            </button>

            {isActive && (
                <div className="absolute top-12 right-0 z-[100] p-2 bg-slate-950/90 rounded-2xl border border-emerald-500/20 backdrop-blur-xl shadow-2xl overflow-hidden w-48 h-36">
                    <video ref={videoRef} className="hidden" playsInline muted />
                    <canvas ref={canvasRef} className="w-full h-full rounded-xl object-cover bg-slate-900/50" width={640} height={480} />

                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div className="w-full px-2 py-1 bg-emerald-500/10 backdrop-blur-sm border-b border-emerald-500/20 absolute top-0 flex justify-between">
                            <span className="text-[8px] font-mono text-emerald-500/80 uppercase">Gesture Node</span>
                            <Zap className="h-2 w-2 text-emerald-500 animate-pulse" />
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute top-12 right-0 z-[101] p-3 bg-red-950/90 rounded-xl border border-red-500/50 flex items-center gap-2 text-red-500">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold">{error}</span>
                </div>
            )}
        </div>
    );
}
