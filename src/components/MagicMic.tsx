import { useState, useRef, forwardRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MagicMicProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const MagicMic = forwardRef<HTMLButtonElement, MagicMicProps>(
  function MagicMic({ onTranscript, disabled }, ref) {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<any>(null);

    const startListening = () => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("Speech recognition not supported");
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsProcessing(true);
        onTranscript(transcript);
        setIsProcessing(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    };

    const stopListening = () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };

    const handleClick = () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    };

    return (
      <Button
        ref={ref}
        size="icon"
        variant={isListening ? "default" : "outline"}
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={cn(
          "relative",
          isListening && "bg-primary text-primary-foreground"
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isListening ? (
          <>
            <Mic className="h-4 w-4" />
            <span className="absolute inset-0 rounded-md animate-pulse-ring bg-primary/50" />
          </>
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </Button>
    );
  }
);

MagicMic.displayName = "MagicMic";

export default MagicMic;
