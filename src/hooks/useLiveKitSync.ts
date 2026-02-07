import { useEffect, useState, useCallback, useRef } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, DataPacket_Kind, RemoteParticipant, LocalParticipant } from "livekit-client";
import { toast } from "sonner";

export interface SharedTool {
    id: string;
    type: string;
    props: Record<string, unknown>;
    createdBy: string;
    timestamp: number;
}

interface SyncState {
    sharedTools: SharedTool[];
    isConnected: boolean;
}

export function useLiveKitSync() {
    const room = useRoomContext();
    const [state, setState] = useState<SyncState>({
        sharedTools: [],
        isConnected: false,
    });

    // Track tools to avoid duplicates and loops
    const processTool = useCallback((tool: SharedTool) => {
        setState(prev => {
            // Check if tool already exists
            if (prev.sharedTools.some(t => t.id === tool.id)) {
                return prev;
            }
            return {
                ...prev,
                sharedTools: [...prev.sharedTools, tool],
            };
        });
    }, []);

    useEffect(() => {
        if (!room) return;

        const onDataReceived = (
            payload: Uint8Array,
            participant?: RemoteParticipant,
            _kind?: DataPacket_Kind
        ) => {
            try {
                const strData = new TextDecoder().decode(payload);
                const data = JSON.parse(strData);

                if (data.type === "tool-added") {
                    processTool(data.tool);
                } else if (data.type === "remote-command") {
                    // Dispatch custom event for GenerativeCanvas to pick up
                    window.dispatchEvent(new CustomEvent("remote-command", { detail: data.payload }));
                }
            } catch (error) {
                console.error("Failed to parse Sync data:", error);
            }
        };

        const onConnected = () => {
            setState(prev => ({ ...prev, isConnected: true }));
        };

        const onDisconnected = () => {
            setState(prev => ({ ...prev, isConnected: false }));
        };

        // Current state check
        if (room.state === "connected") {
            setState(prev => ({ ...prev, isConnected: true }));
        }

        room.on(RoomEvent.DataReceived, onDataReceived);
        room.on(RoomEvent.Connected, onConnected);
        room.on(RoomEvent.Disconnected, onDisconnected);

        return () => {
            room.off(RoomEvent.DataReceived, onDataReceived);
            room.off(RoomEvent.Connected, onConnected);
            room.off(RoomEvent.Disconnected, onDisconnected);
        };
    }, [room, processTool]);

    const sendTool = useCallback((tool: Omit<SharedTool, "createdBy" | "timestamp">) => {
        if (!room || room.state !== "connected") {
            console.warn("Cannot send tool: Room not connected");
            return;
        }

        const sharedTool: SharedTool = {
            ...tool,
            createdBy: room.localParticipant.identity,
            timestamp: Date.now(),
        };

        // Add locally immediately
        processTool(sharedTool);

        // Broadcast to others
        const data = JSON.stringify({
            type: "tool-added",
            tool: sharedTool,
        });

        const payload = new TextEncoder().encode(data);

        room.localParticipant.publishData(payload, { reliable: true });
    }, [room, processTool]);

    return {
        ...state,
        sendTool,
        participants: Array.from(room?.remoteParticipants.values() || []),
        localParticipant: room?.localParticipant,
    };
}
