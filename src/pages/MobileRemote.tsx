import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
    Trophy,
    Timer as TimerIcon,
    BarChart3,
    Map as MapIcon,
    Globe,
    MessageSquare,
    Zap,
    Hand,
    Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MobileRemote() {
    const { roomName } = useParams<{ roomName: string }>();
    const [isConnected, setIsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState<"controls" | "trackpad">("controls");

    useEffect(() => {
        if (!roomName) return;

        const channel = supabase.channel(`canvas-${roomName}`);

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                setIsConnected(true);
                toast.success("Connected to Desk");
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [roomName]);

    const sendCommand = (type: string, params: any = {}) => {
        if (!roomName) return;

        const channel = supabase.channel(`canvas-${roomName}`);
        channel.send({
            type: "broadcast",
            event: "remote-command",
            payload: { type, params, timestamp: Date.now() },
        });


        if (window.navigator.vibrate) {
            window.navigator.vibrate(20);
        }
    };

    const handleTrackpadMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;

        sendCommand("rotate-3d", { x, y });
    };

    if (!isConnected) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-950 text-emerald-500">
                <div className="flex flex-col items-center gap-4">
                    <Zap className="h-10 w-10 animate-pulse" />
                    <p className="font-mono text-sm tracking-widest uppercase">Syncing with Node...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">

            <div className="px-6 py-4 flex items-center justify-between border-b border-emerald-500/20 bg-slate-900/50 backdrop-blur-md">
                <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] uppercase">Tambo Remote</span>
                    <h1 className="text-lg font-bold tracking-tight">{roomName}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Live</span>
                </div>
            </div>


            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === "controls" ? (
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAction
                            icon={<TimerIcon />}
                            label="Timer"
                            onClick={() => sendCommand("create-tool", { type: "timer", initialSeconds: 300 })}
                        />
                        <QuickAction
                            icon={<BarChart3 />}
                            label="Poll"
                            onClick={() => sendCommand("create-tool", { type: "poll", topic: "Next Steps" })}
                        />
                        <QuickAction
                            icon={<Globe />}
                            label="3D Globe"
                            onClick={() => sendCommand("create-tool", { type: "globe" })}
                        />
                        <QuickAction
                            icon={<Trophy />}
                            label="Scores"
                            onClick={() => sendCommand("create-tool", { type: "scoreboard" })}
                        />
                        <QuickAction
                            icon={<MapIcon />}
                            label="Live Map"
                            onClick={() => sendCommand("create-tool", { type: "map" })}
                        />
                        <QuickAction
                            icon={<Maximize2 />}
                            label="Zoom All"
                            onClick={() => sendCommand("ui-action", { action: "zoom-in" })}
                        />
                    </div>
                ) : (
                    <div
                        className="w-full aspect-square bg-slate-900 rounded-3xl border-2 border-emerald-500/20 shadow-inner flex flex-col items-center justify-center gap-4 relative touch-none"
                        onTouchMove={handleTrackpadMove}
                    >
                        <Hand className="h-12 w-12 text-emerald-500 opacity-20" />
                        <p className="text-xs text-emerald-500/40 uppercase font-bold tracking-widest">3D Interaction Pad</p>


                        <div className="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-lg" />
                        <div className="absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-emerald-500/40 rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-emerald-500/40 rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-emerald-500/40 rounded-br-lg" />
                    </div>
                )}
            </div>


            <div className="px-6 py-4 pb-8 border-t border-emerald-500/10 flex gap-4">
                <Button
                    variant={activeTab === "controls" ? "default" : "ghost"}
                    className={cn("flex-1 h-14 rounded-2xl gap-2", activeTab === "controls" && "bg-emerald-600 hover:bg-emerald-500")}
                    onClick={() => setActiveTab("controls")}
                >
                    <MessageSquare className="h-5 w-5" />
                    <span>Tools</span>
                </Button>
                <Button
                    variant={activeTab === "trackpad" ? "default" : "ghost"}
                    className={cn("flex-1 h-14 rounded-2xl gap-2", activeTab === "trackpad" && "bg-emerald-600 hover:bg-emerald-500")}
                    onClick={() => setActiveTab("trackpad")}
                >
                    <Hand className="h-5 w-5" />
                    <span>Motion</span>
                </Button>
            </div>
        </div>
    );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <Card
            onClick={onClick}
            className="bg-slate-900/50 border-emerald-500/10 hover:border-emerald-500/40 transition-all active:scale-95 cursor-pointer p-6 flex flex-col items-center gap-3 group"
        >
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                {icon}
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-tighter">{label}</span>
        </Card>
    );
}
