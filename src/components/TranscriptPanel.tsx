import { useState } from "react";
import { ChevronDown, ChevronUp, Mic, MicOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useContinuousTranscription } from "@/hooks/useContinuousTranscription";

interface TranscriptPanelProps {
  onTranscript?: (text: string) => void;
  className?: string;
}

export function TranscriptPanel({ onTranscript, className }: TranscriptPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const {
    isListening,
    isSupported,
    transcript,
    interimText,
    error,
    startListening,
    stopListening,
    clearTranscript,
  } = useContinuousTranscription({
    onTranscript,
    debounceMs: 3000,
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (!isSupported) {
    return (
      <div className={cn("text-xs text-muted-foreground p-2", className)}>
        Speech recognition not supported in this browser
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isListening ? "default" : "outline"}
            className="h-7 w-7 p-0"
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? (
              <Mic className="h-3.5 w-3.5" />
            ) : (
              <MicOff className="h-3.5 w-3.5" />
            )}
          </Button>
          <span className="text-xs font-medium text-foreground">
            {isListening ? "Transcribing" : "Transcript"}
          </span>
          {isListening && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {transcript.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={clearTranscript}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <CollapsibleTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              {isOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <ScrollArea className="h-32 bg-background/50">
          <div className="p-3 space-y-2">
            {error && (
              <div className="text-xs text-destructive">{error}</div>
            )}

            {transcript.length === 0 && !interimText && !error && (
              <div className="text-xs text-muted-foreground text-center py-4">
                {isListening
                  ? "Listening for speech..."
                  : "Click the mic to start continuous transcription"
                }
              </div>
            )}

            {transcript.map((entry, index) => (
              <div key={index} className="flex gap-2 text-xs">
                <span className="text-muted-foreground shrink-0 font-mono">
                  {formatTime(entry.timestamp)}
                </span>
                <span className="text-foreground">{entry.text}</span>
              </div>
            ))}

            {interimText && (
              <div className="flex gap-2 text-xs">
                <span className="text-muted-foreground shrink-0 font-mono">
                  {formatTime(new Date())}
                </span>
                <span className="text-muted-foreground italic">{interimText}</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default TranscriptPanel;
