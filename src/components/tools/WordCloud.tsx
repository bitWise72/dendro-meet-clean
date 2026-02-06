import { useMemo } from "react";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordItem {
  text: string;
  weight: number;
}

interface WordCloudProps {
  words: WordItem[];
  title?: string;
  className?: string;
  overlay?: boolean;
  onWordClick?: (word: string) => void;
}

export function WordCloud({
  words,
  title = "Topic Cloud",
  className,
  overlay = false,
  onWordClick,
}: WordCloudProps) {
  const processedWords = useMemo(() => {
    if (!words.length) return [];

    const maxWeight = Math.max(...words.map((w) => w.weight));
    const minWeight = Math.min(...words.map((w) => w.weight));
    const range = maxWeight - minWeight || 1;

    return words
      .map((word) => ({
        ...word,
        // Normalize weight to 0-1 range
        normalizedWeight: (word.weight - minWeight) / range,
      }))
      .sort(() => Math.random() - 0.5); // Shuffle for visual variety
  }, [words]);

  const getFontSize = (normalizedWeight: number) => {
    const minSize = 12;
    const maxSize = 32;
    return minSize + normalizedWeight * (maxSize - minSize);
  };

  const getOpacity = (normalizedWeight: number) => {
    return 0.5 + normalizedWeight * 0.5;
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
        <Cloud className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 min-h-32 py-4">
        {processedWords.length === 0 ? (
          <p className="text-sm text-muted-foreground">No words to display</p>
        ) : (
          processedWords.map((word, index) => (
            <button
              key={`${word.text}-${index}`}
              onClick={() => onWordClick?.(word.text)}
              className={cn(
                "transition-all hover:text-primary hover:scale-110 cursor-pointer",
                onWordClick && "hover:underline"
              )}
              style={{
                fontSize: `${getFontSize(word.normalizedWeight)}px`,
                opacity: getOpacity(word.normalizedWeight),
                color:
                  word.normalizedWeight > 0.7
                    ? "hsl(var(--primary))"
                    : "hsl(var(--foreground))",
              }}
            >
              {word.text}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default WordCloud;
