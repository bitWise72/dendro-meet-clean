import { Trophy, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreEntry {
  name: string;
  score: number;
  avatar?: string;
}

interface ScoreboardProps {
  title?: string;
  entries: ScoreEntry[];
  className?: string;
  overlay?: boolean;
}

export function Scoreboard({
  title = "Leaderboard",
  entries,
  className,
  overlay = false,
}: ScoreboardProps) {
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return (
          <span className="text-xs font-mono text-muted-foreground w-4 text-center">
            {rank}
          </span>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30";
      case 2:
        return "bg-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-amber-600/10 border-amber-600/30";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "tool-card rounded-lg overflow-hidden",
        overlay && "bg-card/90 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Star className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>

      <div className="divide-y divide-border">
        {sortedEntries.map((entry, index) => (
          <div
            key={entry.name}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 transition-colors",
              getRankBg(index + 1),
              index < 3 && "border-l-2",
              index === 0 && "border-l-yellow-500",
              index === 1 && "border-l-gray-400",
              index === 2 && "border-l-amber-600"
            )}
          >
            <div className="w-6 flex items-center justify-center">
              {getRankIcon(index + 1)}
            </div>

            {entry.avatar ? (
              <img
                src={entry.avatar}
                alt={entry.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                {entry.name.charAt(0).toUpperCase()}
              </div>
            )}

            <span className="flex-1 text-sm font-medium text-foreground truncate">
              {entry.name}
            </span>

            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                index === 0 && "text-yellow-500",
                index === 1 && "text-gray-400",
                index === 2 && "text-amber-600",
                index >= 3 && "text-muted-foreground"
              )}
            >
              {entry.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Scoreboard;
