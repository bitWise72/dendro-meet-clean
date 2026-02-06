import { useState } from "react";
import { Vote, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PollProps {
  question?: string;
  options?: string[];
  onVote?: (results: { option: string; votes: number }[]) => void;
}

const DEFAULT_OPTIONS = ["Option A", "Option B", "Option C"];

export function Poll({ question = "Quick Poll", options = DEFAULT_OPTIONS, onVote }: PollProps) {
  const safeOptions = Array.isArray(options) && options.length > 0 ? options : DEFAULT_OPTIONS;

  const [votes, setVotes] = useState<Record<number, number>>(() =>
    Object.fromEntries(safeOptions.map((_, i) => [i, 0]))
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasTriggeredChain, setHasTriggeredChain] = useState(false);

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  const handleVote = (index: number) => {
    if (hasVoted) return;
    setSelectedOption(index);
    const newVotes = { ...votes, [index]: votes[index] + 1 };
    setVotes(newVotes);
    setHasVoted(true);

    // Trigger chain event
    if (!hasTriggeredChain && onVote) {
      setHasTriggeredChain(true);
      const results = safeOptions.map((opt, i) => ({
        option: opt,
        votes: newVotes[i],
      }));
      onVote(results);
    }
  };

  return (
    <div className="tool-card rounded-lg overflow-hidden animate-fade-in">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Vote className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Poll</span>
        {hasTriggeredChain && (
          <div className="flex items-center gap-1 ml-2 text-xs text-primary">
            <Link2 className="h-3 w-3" />
            <span>Chained</span>
          </div>
        )}
        {hasVoted && (
          <span className="text-xs text-muted-foreground ml-auto">
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">{question}</p>
        <div className="space-y-2">
          {safeOptions.map((option, index) => {
            const percentage =
              totalVotes > 0 ? Math.round((votes[index] / totalVotes) * 100) : 0;
            const isSelected = selectedOption === index;

            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full justify-start relative overflow-hidden h-auto py-2 px-3",
                  hasVoted && "pointer-events-none",
                  isSelected && "border-primary"
                )}
                onClick={() => handleVote(index)}
              >
                {hasVoted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <span className="relative flex items-center gap-2 text-sm">
                  {isSelected && <Check className="h-3 w-3 text-primary" />}
                  {option}
                </span>
                {hasVoted && (
                  <span className="relative ml-auto text-xs text-muted-foreground">
                    {percentage}%
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Poll;