import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Reaction {
  id: string;
  icon: string;
  x: number;
  y: number;
}

interface ReactionsProps {
  reactions?: { icon: string; label: string }[];
  onReact?: (icon: string) => void;
  className?: string;
  overlay?: boolean;
}

const DEFAULT_REACTIONS = [
  { icon: "+1", label: "thumbs up" },
  { icon: "-1", label: "thumbs down" },
  { icon: "!", label: "important" },
  { icon: "?", label: "question" },
  { icon: "*", label: "star" },
];

export function Reactions({
  reactions = DEFAULT_REACTIONS,
  onReact,
  className,
  overlay = true,
}: ReactionsProps) {
  const [floatingReactions, setFloatingReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    // Clean up old reactions
    const interval = setInterval(() => {
      setFloatingReactions((prev) =>
        prev.filter((r) => Date.now() - parseInt(r.id) < 3000)
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleReaction = (icon: string) => {
    const id = Date.now().toString();
    const x = 20 + Math.random() * 60; // Random x position (20-80%)
    
    setFloatingReactions((prev) => [
      ...prev,
      { id, icon, x, y: 100 },
    ]);

    onReact?.(icon);
  };

  return (
    <div
      className={cn(
        "relative",
        overlay ? "fixed bottom-20 left-4 z-50" : "tool-card rounded-lg p-3",
        className
      )}
    >
      {/* Floating reactions */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {floatingReactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute text-2xl animate-float-up"
            style={{
              left: `${reaction.x}%`,
              bottom: 100,
            }}
          >
            {reaction.icon}
          </div>
        ))}
      </div>

      {/* Reaction buttons */}
      <div
        className={cn(
          "flex items-center gap-1",
          overlay && "bg-card/90 backdrop-blur-md rounded-full px-2 py-1 shadow-lg border border-border"
        )}
      >
        {reactions.map((reaction) => (
          <button
            key={reaction.label}
            onClick={() => handleReaction(reaction.icon)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-lg",
              "transition-all hover:scale-125 hover:bg-muted",
              "active:scale-95"
            )}
            title={reaction.label}
          >
            {reaction.icon}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-100px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.8);
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Reactions;
