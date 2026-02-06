 import { useEffect, useState, useCallback, useRef } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import type { RealtimeChannel } from "@supabase/supabase-js";
 
 interface Participant {
   id: string;
   name: string;
   color: string;
   cursorX?: number;
   cursorY?: number;
   lastSeen: number;
 }
 
 interface SharedTool {
   id: string;
   type: string;
   props: Record<string, unknown>;
   createdBy: string;
   timestamp: number;
 }
 
 interface CollaborationState {
   participants: Participant[];
   sharedTools: SharedTool[];
   isConnected: boolean;
 }
 
 const COLORS = [
   "#10b981", "#3b82f6", "#f59e0b", "#ef4444", 
   "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
 ];
 
 export function useCollaboration(roomName: string, participantName: string) {
   const [state, setState] = useState<CollaborationState>({
     participants: [],
     sharedTools: [],
     isConnected: false,
   });
   const channelRef = useRef<RealtimeChannel | null>(null);
   const participantId = useRef(`${participantName}-${Date.now()}`);
   const colorRef = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]);
 
   useEffect(() => {
     if (!roomName || !participantName) return;
 
     const channel = supabase.channel(`canvas-${roomName}`, {
       config: { presence: { key: participantId.current } },
     });
 
     channel
       .on("presence", { event: "sync" }, () => {
         const presenceState = channel.presenceState();
         const participants: Participant[] = [];
         
         for (const [key, value] of Object.entries(presenceState)) {
           const presence = (value as any[])[0];
           if (presence) {
             participants.push({
               id: key,
               name: presence.name || "Anonymous",
               color: presence.color || "#10b981",
               cursorX: presence.cursorX,
               cursorY: presence.cursorY,
               lastSeen: presence.lastSeen || Date.now(),
             });
           }
         }
         
         setState(prev => ({ ...prev, participants }));
       })
       .on("broadcast", { event: "tool-added" }, ({ payload }) => {
         setState(prev => ({
           ...prev,
           sharedTools: [...prev.sharedTools, payload as SharedTool],
         }));
       })
       .on("broadcast", { event: "tool-updated" }, ({ payload }) => {
         setState(prev => ({
           ...prev,
           sharedTools: prev.sharedTools.map(t => 
             t.id === payload.id ? { ...t, ...payload } : t
           ),
         }));
       })
       .subscribe(async (status) => {
         if (status === "SUBSCRIBED") {
           await channel.track({
             name: participantName,
             color: colorRef.current,
             lastSeen: Date.now(),
           });
           setState(prev => ({ ...prev, isConnected: true }));
         }
       });
 
     channelRef.current = channel;
 
     return () => {
       channel.unsubscribe();
       channelRef.current = null;
       setState(prev => ({ ...prev, isConnected: false }));
     };
   }, [roomName, participantName]);
 
   const broadcastTool = useCallback((tool: Omit<SharedTool, "createdBy" | "timestamp">) => {
     if (!channelRef.current) return;
     
     const sharedTool: SharedTool = {
       ...tool,
       createdBy: participantName,
       timestamp: Date.now(),
     };
 
     channelRef.current.send({
       type: "broadcast",
       event: "tool-added",
       payload: sharedTool,
     });
   }, [participantName]);
 
   const updateToolState = useCallback((toolId: string, updates: Partial<SharedTool>) => {
     if (!channelRef.current) return;
     
     channelRef.current.send({
       type: "broadcast",
       event: "tool-updated",
       payload: { id: toolId, ...updates },
     });
   }, []);
 
   const updateCursor = useCallback((x: number, y: number) => {
     if (!channelRef.current) return;
     
     channelRef.current.track({
       name: participantName,
       color: colorRef.current,
       cursorX: x,
       cursorY: y,
       lastSeen: Date.now(),
     });
   }, [participantName]);
 
   return {
     ...state,
     myId: participantId.current,
     myColor: colorRef.current,
     broadcastTool,
     updateToolState,
     updateCursor,
   };
 }