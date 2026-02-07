import { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { VideoRoom, VideoMainInterface } from "@/components/VideoRoom";
import { GenerativeCanvas } from "@/components/GenerativeCanvas";
import { Video, Sparkles } from "lucide-react";
import { LogoWithText } from "@/components/Logo";

const Index = () => {
  const [serverUrl, setServerUrl] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [participantName, setParticipantName] = useState<string>("");

  useEffect(() => {
    const fetchServerUrl = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/livekit-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ getServerUrl: true }),
          }
        );
        const data = await response.json();
        if (data.serverUrl) {
          setServerUrl(data.serverUrl);
        }
      } catch (err) {
        console.error("Failed to fetch server URL:", err);
      }
    };

    fetchServerUrl();
  }, []);

  const handleRoomJoined = (room: string, participant: string) => {
    setRoomName(room);
    setParticipantName(participant);
  };

  const handleRoomLeft = () => {
    setRoomName("");
    setParticipantName("");
  };

  return (
    <div className="h-screen flex flex-col bg-background selection:bg-primary/20">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <LogoWithText />
        <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default group">
            <div className="p-1 px-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
              <Video className="h-3.5 w-3.5" />
            </div>
            <span>LiveKit HD</span>
          </div>
          <div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default group">
            <div className="p-1 px-2 rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-all">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span>Tambo Orchestrator</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <VideoRoom
          serverUrl={serverUrl || undefined}
          onRoomJoined={handleRoomJoined}
          onRoomLeft={handleRoomLeft}
        >
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full border-r border-border">
                <VideoMainInterface />
              </div>
            </ResizablePanel>
            <ResizableHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />
            <ResizablePanel defaultSize={50} minSize={30}>
              <GenerativeCanvas roomName={roomName} participantName={participantName} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </VideoRoom>
      </main>
    </div>
  );
};

export default Index;