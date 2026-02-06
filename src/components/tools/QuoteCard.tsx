import { Quote, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: string;
  speaker?: string;
  timestamp?: string;
  className?: string;
  overlay?: boolean;
}

export function QuoteCard({
  quote,
  speaker,
  timestamp,
  className,
  overlay = false,
}: QuoteCardProps) {
  return (
    <div
      className={cn(
        "tool-card rounded-lg p-4",
        overlay && "bg-card/80 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Quote className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-lg font-medium leading-relaxed">
            "{quote}"
          </p>
          
          {(speaker || timestamp) && (
            <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
              {speaker && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{speaker}</span>
                </div>
              )}
              {timestamp && (
                <span className="text-xs font-mono">{timestamp}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuoteCard;
