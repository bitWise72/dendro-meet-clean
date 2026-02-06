import { useState, useRef, ReactNode, useCallback } from "react";
import { GripVertical, X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface OverlayToolProps {
  children: ReactNode;
  title?: string;
  initialPosition?: { x: number; y: number };
  initialOpacity?: number;
  onClose?: () => void;
  className?: string;
}

export function OverlayTool({
  children,
  title,
  initialPosition = { x: 100, y: 100 },
  initialOpacity = 85,
  onClose,
  className,
}: OverlayToolProps) {
  const [position, setPosition] = useState(initialPosition);
  const [opacity, setOpacity] = useState(initialOpacity);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const positionStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { x: position.x, y: position.y };
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !positionStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setPosition({
      x: Math.max(0, positionStartRef.current.x + deltaX),
      y: Math.max(0, positionStartRef.current.y + deltaY),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    positionStartRef.current = null;
  }, []);

  useState(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div
      className={cn(
        "absolute pointer-events-auto transition-shadow",
        isDragging && "shadow-2xl",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        opacity: opacity / 100,
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isDragging && setShowControls(false)}
    >
      {/* Control bar */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-2 py-1 rounded-t-lg transition-opacity",
          "bg-card/90 backdrop-blur-md border border-b-0 border-border",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center gap-1">
          <button
            onMouseDown={handleMouseDown}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {title && (
            <span className="text-xs font-medium text-muted-foreground">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Opacity control */}
          <div className="flex items-center gap-1 px-2">
            <Minus className="h-3 w-3 text-muted-foreground" />
            <Slider
              value={[opacity]}
              onValueChange={([value]) => setOpacity(value)}
              min={20}
              max={100}
              step={5}
              className="w-16"
            />
            <Plus className="h-3 w-3 text-muted-foreground" />
          </div>

          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-b-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default OverlayTool;
