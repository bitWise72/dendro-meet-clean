import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface TranscriptEntry {
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface UseContinuousTranscriptionOptions {
  onTranscript?: (text: string) => void;
  debounceMs?: number;
  language?: string;
  autoStart?: boolean;
}

export function useContinuousTranscription({
  onTranscript,
  debounceMs = 2000,
  language = "en-US",
  autoStart = false,
}: UseContinuousTranscriptionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTextRef = useRef<string>("");
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const processTranscript = useCallback(
    (text: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      pendingTextRef.current = text;

      debounceTimerRef.current = setTimeout(() => {
        if (pendingTextRef.current.trim() && onTranscript) {
          onTranscript(pendingTextRef.current.trim());
          pendingTextRef.current = "";
        }
      }, debounceMs);
    },
    [onTranscript, debounceMs]
  );

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setInterimText(interimTranscript);

      if (finalTranscript) {
        const entry: TranscriptEntry = {
          text: finalTranscript.trim(),
          timestamp: new Date(),
          isFinal: true,
        };
        setTranscript((prev) => [...prev, entry]);
        processTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access.");
        setIsListening(false);
      } else if (event.error === "no-speech") {

      } else if (event.error === "aborted") {

        setIsListening(false);
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {

      if (isListening && !error) {
        restartTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {

            }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setError("Failed to start speech recognition");
    }
  }, [isSupported, language, isListening, error, processTranscript]);

  const stopListening = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
    setInterimText("");
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
    setInterimText("");
    pendingTextRef.current = "";
  }, []);


  useEffect(() => {
    if (autoStart && isSupported && !isListening) {
      startListening();
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [autoStart, isSupported]);

  return {
    isListening,
    isSupported,
    transcript,
    interimText,
    error,
    startListening,
    stopListening,
    clearTranscript,
  };
}

export default useContinuousTranscription;
