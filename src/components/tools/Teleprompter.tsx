import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeleprompterProps {
  text: string;
  speed?: number; // pixels per second
  fontSize?: number;
  className?: string;
  overlay?: boolean;
}

export function Teleprompter({
  text,
  speed = 30,
  fontSize = 24,
  className,
  overlay = true,
}: TeleprompterProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && contentRef.current && containerRef.current) {
        const maxScroll =
          contentRef.current.scrollHeight - containerRef.current.clientHeight;
        
        setScrollPosition((prev) => {
          const next = prev + currentSpeed * deltaTime;
          if (next >= maxScroll) {
            setIsPlaying(false);
            return maxScroll;
          }
          return next;
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, currentSpeed]);

  const reset = () => {
    setScrollPosition(0);
    setIsPlaying(false);
  };

  const adjustSpeed = (delta: number) => {
    setCurrentSpeed((prev) => Math.max(10, Math.min(100, prev + delta)));
  };

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        overlay
          ? "bg-black/90 backdrop-blur-md border border-border"
          : "tool-card",
        className
      )}
    >
      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Teleprompter</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => adjustSpeed(-10)}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-mono w-8 text-center text-muted-foreground">
            {currentSpeed}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => adjustSpeed(10)}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={reset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={isPlaying ? "default" : "outline"}
            className="h-7 w-7 p-0"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Text container */}
      <div
        ref={containerRef}
        className="h-48 overflow-hidden relative"
        style={{ perspective: "500px" }}
      >
        {/* Gradient overlays for readability */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

        {/* Center highlight line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 border-y border-primary/30 bg-primary/5 z-5 pointer-events-none" />

        <div
          ref={contentRef}
          className="px-6 py-16 text-center"
          style={{
            transform: `translateY(-${scrollPosition}px)`,
            fontSize: `${fontSize}px`,
            lineHeight: 1.8,
          }}
        >
          <p className="text-foreground font-medium whitespace-pre-wrap">
            {text}
          </p>
          {/* Extra padding at bottom for full scroll */}
          <div className="h-32" />
        </div>
      </div>
    </div>
  );
}

export default Teleprompter;
