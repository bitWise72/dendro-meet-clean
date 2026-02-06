import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimerProps {
  initialSeconds?: number;
  mode?: "countdown" | "stopwatch";
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (seconds: number) => void;
  className?: string;
  overlay?: boolean;
}

export function Timer({
  initialSeconds = 300,
  mode = "countdown",
  autoStart = false,
  onComplete,
  onTick,
  className,
  overlay = false,
}: TimerProps) {
  const [seconds, setSeconds] = useState(mode === "countdown" ? initialSeconds : 0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = mode === "countdown" ? prev - 1 : prev + 1;
          onTick?.(next);

          if (mode === "countdown" && next <= 0) {
            setIsRunning(false);
            setHasCompleted(true);
            onComplete?.();
            return 0;
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, onComplete, onTick]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const reset = useCallback(() => {
    setSeconds(mode === "countdown" ? initialSeconds : 0);
    setIsRunning(false);
    setHasCompleted(false);
  }, [mode, initialSeconds]);

  const getProgressPercent = () => {
    if (mode === "countdown") {
      return ((initialSeconds - seconds) / initialSeconds) * 100;
    }
    return 0;
  };

  return (
    <div
      className={cn(
        "tool-card rounded-lg p-4",
        overlay && "bg-card/80 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {mode === "countdown" ? "Countdown" : "Stopwatch"}
        </span>
      </div>

      <div className="relative">
        {mode === "countdown" && (
          <div className="absolute inset-0 bg-muted rounded-lg overflow-hidden">
            <div
              className="h-full bg-primary/20 transition-all duration-1000"
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>
        )}

        <div
          className={cn(
            "relative text-center py-6 font-mono text-4xl font-bold",
            hasCompleted && "text-primary animate-pulse",
            !hasCompleted && "text-foreground"
          )}
        >
          {formatTime(seconds)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <Button
          size="sm"
          variant={isRunning ? "secondary" : "default"}
          onClick={() => setIsRunning(!isRunning)}
          disabled={hasCompleted && mode === "countdown"}
        >
          {isRunning ? (
            <>
              <Pause className="h-3.5 w-3.5 mr-1.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 mr-1.5" />
              {hasCompleted ? "Done" : "Start"}
            </>
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}

export default Timer;
