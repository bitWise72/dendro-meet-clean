import { useState, useCallback, useEffect } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomName,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Video, Users, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface VideoRoomProps {
  serverUrl?: string;
  onRoomJoined?: (roomName: string, participantName: string) => void;
  onRoomLeft?: () => void;
  children?: React.ReactNode;
}

function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout tracks={tracks} className="h-full">
      <ParticipantTile />
    </GridLayout>
  );
}

export function VideoRoom({ serverUrl, onRoomJoined, onRoomLeft, children }: VideoRoomProps) {
  const [token, setToken] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("dendro-room");
  const [participantName, setParticipantName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinRoom = useCallback(async () => {
    if (!participantName.trim() || !roomName.trim()) {
      setError("Please enter room name and your name");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("livekit-token", {
        body: {
          roomName: roomName.trim(),
          participantName: participantName.trim(),
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.token) {
        setToken(data.token);
        onRoomJoined?.(roomName.trim(), participantName.trim());
      } else {
        throw new Error("No token received");
      }
    } catch (err) {
      console.error("Failed to get token:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  }, [roomName, participantName]);

  const handleDisconnect = useCallback(() => {
    setToken(null);
    onRoomLeft?.();
  }, [onRoomLeft]);

  if (!token) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-background">
        <div className="glass-panel rounded-lg p-6 w-full max-w-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Video className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Join Meeting</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Room Name
              </label>
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="meeting-room"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Your Name
              </label>
              <Input
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={joinRoom}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Join Room
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={true}
      onDisconnected={handleDisconnect}
      data-lk-theme="default"
      className="h-full livekit-meet"
      style={{
        '--lk-bg': 'hsl(var(--background))',
        '--lk-bg2': 'hsl(var(--muted))',
        '--lk-accent-fg': 'hsl(var(--primary-foreground))',
        '--lk-accent-bg': 'hsl(var(--primary))',
      } as React.CSSProperties}
    >
      {children || <VideoMainInterface />}

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

export function VideoMainInterface() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <RoomName className="text-sm font-medium text-foreground" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs">Live</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-background">
        <VideoGrid />
      </div>
      <ControlBar
        variation="minimal"
        controls={{
          microphone: true,
          camera: true,
          screenShare: true,
          leave: true,
        }}
        className="border-t border-border bg-background/80 backdrop-blur-sm"
      />
    </div>
  );
}

export default VideoRoom;