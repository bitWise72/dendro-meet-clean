import { MessageCircle, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  quote: string;
  speaker?: string;
  highlight?: string;
  className?: string;
  overlay?: boolean;
}

export function Spotlight({
  quote,
  speaker,
  highlight,
  className,
  overlay = true,
}: SpotlightProps) {
  // Highlight specific text if provided
  const renderQuote = () => {
    if (!highlight) {
      return quote;
    }

    const parts = quote.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="text-primary font-semibold bg-primary/20 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl p-5 relative overflow-hidden",
        overlay
          ? "bg-gradient-to-br from-primary/20 via-card/90 to-card/80 backdrop-blur-lg border border-primary/30 shadow-xl shadow-primary/10"
          : "tool-card",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Spotlight
          </span>
        </div>

        <div className="flex gap-3">
          <MessageCircle className="h-8 w-8 text-primary/60 shrink-0 mt-1" />
          <div>
            <p className="text-xl font-medium text-foreground leading-relaxed">
              "{renderQuote()}"
            </p>

            {speaker && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{speaker}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Spotlight;
