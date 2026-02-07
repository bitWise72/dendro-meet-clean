import { useState, lazy, Suspense, useCallback, useRef, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  Sparkles,
  MessageSquare,
  Loader2,
  Send,
  Link2,
  Users,
  Layers,
  Mic,
  Smartphone,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MagicMic } from "./MagicMic";
import { TranscriptPanel } from "./TranscriptPanel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEventChain, ChainRule } from "@/hooks/useEventChain";
import { useLiveKitSync, SharedTool } from "@/hooks/useLiveKitSync";
import { parseIntent } from "@/lib/intent-engine";

import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


const LiveMap = lazy(() => import("./tambo/LiveMap"));
const MermaidChart = lazy(() => import("./tambo/MermaidChart"));
const Poll = lazy(() => import("./tambo/Poll"));


const Timer = lazy(() => import("./tools/Timer"));
const QuoteCard = lazy(() => import("./tools/QuoteCard"));
const ActionItem = lazy(() => import("./tools/ActionItem"));
const Agenda = lazy(() => import("./tools/Agenda"));
const MediaEmbed = lazy(() => import("./tools/MediaEmbed"));
const LiveChart = lazy(() => import("./tools/LiveChart"));
const WordCloud = lazy(() => import("./tools/WordCloud"));
const Reactions = lazy(() => import("./tools/Reactions"));
const QRCode = lazy(() => import("./tools/QRCode"));
const Scoreboard = lazy(() => import("./tools/Scoreboard"));
const Spotlight = lazy(() => import("./tools/Spotlight"));
const Teleprompter = lazy(() => import("./tools/Teleprompter"));


const Scene3D = lazy(() => import("./3d/Scene3D"));
const Globe3D = lazy(() => import("./3d/Globe3D"));
const DataCube = lazy(() => import("./3d/DataCube"));
const ParticleField = lazy(() => import("./3d/ParticleField"));

type ToolType =
  | "map" | "chart" | "poll"
  | "timer" | "quoteCard" | "actionItem" | "agenda" | "mediaEmbed"
  | "liveChart" | "wordCloud" | "reactions" | "qrCode" | "scoreboard"
  | "spotlight" | "teleprompter"
  | "globe3D" | "dataCube" | "particleField";

interface ToolData {
  type: ToolType;
  id: string;
  props: any;
  isChained?: boolean;
  chainSource?: string;
  overlay?: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  tools?: ToolData[];
}

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-tools`;


const OVERLAY_COMPATIBLE_TOOLS: ToolType[] = [
  "timer", "quoteCard", "actionItem", "wordCloud", "reactions",
  "qrCode", "scoreboard", "spotlight", "teleprompter"
];

interface ToolComponentProps {
  tool: ToolData;
  onEvent?: (eventType: string, data: any) => void;
  isChainActive?: boolean;
  animationDelay?: number;
  onDelete?: () => void;
}

function ToolComponent({ tool, onEvent, isChainActive, animationDelay = 0, onDelete }: ToolComponentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay + 300);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const renderTool = () => {
    switch (tool.type) {

      case "map":
        return (
          <LiveMap
            {...tool.props}
            onMarkerClick={(marker: any) => onEvent?.("marker-click", marker)}
          />
        );
      case "chart":
        return (
          <MermaidChart
            {...tool.props}
            onNodeClick={(nodeLabel: string) => onEvent?.("node-click", { nodeLabel })}
          />
        );
      case "poll":
        return (
          <Poll
            {...tool.props}
            onVote={(results: any) => onEvent?.("vote", {
              question: tool.props.question,
              results
            })}
          />
        );


      case "timer":
        return <Timer {...tool.props} />;
      case "quoteCard":
        return <QuoteCard {...tool.props} />;
      case "actionItem":
        return (
          <ActionItem
            {...tool.props}
            onToggle={(completed) => onEvent?.("action-toggle", { completed })}
          />
        );
      case "agenda":
        return (
          <Agenda
            {...tool.props}
            onItemToggle={(id, completed) => onEvent?.("agenda-toggle", { id, completed })}
          />
        );
      case "teleprompter":
        return <Teleprompter {...tool.props} />;


      case "reactions":
        return (
          <Reactions
            {...tool.props}
            overlay={false}
            onReact={(icon) => onEvent?.("reaction", { icon })}
          />
        );
      case "qrCode":
        return <QRCode {...tool.props} />;
      case "scoreboard":
        return <Scoreboard {...tool.props} />;


      case "liveChart":
        return <LiveChart {...tool.props} />;
      case "wordCloud":
        return (
          <WordCloud
            {...tool.props}
            onWordClick={(word) => onEvent?.("word-click", { word })}
          />
        );
      case "spotlight":
        return <Spotlight {...tool.props} />;


      case "mediaEmbed":
        return <MediaEmbed {...tool.props} />;


      case "globe3D":
        return (
          <div className="h-64 rounded-lg overflow-hidden tool-card">
            <Scene3D>
              <Globe3D
                {...tool.props}
                onMarkerClick={(marker) => onEvent?.("globe-marker-click", marker)}
              />
            </Scene3D>
          </div>
        );
      case "dataCube":
        return (
          <div className="h-64 rounded-lg overflow-hidden tool-card">
            <Scene3D>
              <DataCube {...tool.props} />
            </Scene3D>
          </div>
        );
      case "particleField":
        return (
          <div className="h-48 rounded-lg overflow-hidden tool-card">
            <Scene3D>
              <ParticleField {...tool.props} />
            </Scene3D>
          </div>
        );

      default:
        return (
          <div className="tool-card rounded-lg p-4 text-sm text-muted-foreground">
            Unknown tool type: {tool.type}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "tool-3d-container transform transition-all duration-700 ease-out",
        !isVisible && "opacity-0 translate-y-8 scale-95",
        isVisible && "opacity-100 translate-y-0 scale-100",
        isVisible && tool.isChained && "tool-flip-enter",
        isChainActive && "tool-chain-active"
      )}
    >
      <div className="tool-3d-card relative group">
        {onDelete && (
          <button
            onClick={onDelete}
            className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            title="Remove tool"
          >
            ×
          </button>
        )}
        {tool.isChained && (
          <div className="flex items-center gap-1.5 text-xs text-primary mb-2">
            <Link2 className="h-3 w-3" />
            <span>Chained from {tool.chainSource}</span>
          </div>
        )}
        <Suspense
          fallback={
            <div className="tool-card rounded-lg p-4 flex items-center justify-center min-h-24">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          }
        >
          {renderTool()}
        </Suspense>
      </div>
    </div>
  );
}

interface GenerativeCanvasProps {
  roomName?: string;
  participantName?: string;
}

export function GenerativeCanvas({ roomName = "", participantName = "" }: GenerativeCanvasProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);


  const sync = useLiveKitSync();


  const handleChainTriggered = useCallback((targetType: string, props: any, rule: ChainRule) => {
    const chainedTool: ToolData = {
      type: targetType as ToolType,
      id: `chained-${targetType}-${Date.now()}`,
      props,
      isChained: true,
      chainSource: rule.sourceTool,
    };

    const chainMessage: Message = {
      role: "assistant",
      content: `Chain triggered: ${rule.description}`,
      tools: [chainedTool],
    };

    setMessages(prev => [...prev, chainMessage]);


    if (sync.isConnected) {
      sync.sendTool({
        id: chainedTool.id,
        type: chainedTool.type,
        props: chainedTool.props,
      });
    }

    toast.success("Event chain triggered!");
  }, [sync]);

  const { emitEvent, activeChainId } = useEventChain(handleChainTriggered);

  const handleToolEvent = useCallback((toolId: string, toolType: string) => {
    return (eventType: string, data: any) => {
      emitEvent(toolId, toolType, eventType, data);
    };
  }, [emitEvent]);


  const deleteTool = useCallback((toolId: string) => {
    setMessages(prev => prev.filter(msg => {
      if (msg.tools?.some(t => t.id === toolId)) {
        const remainingTools = msg.tools.filter(t => t.id !== toolId);
        if (remainingTools.length === 0) return false;
        msg.tools = remainingTools;
        return true;
      }
      return true;
    }));
    toast.success("Tool removed");
  }, []);

  const localToolIds = new Set(messages.flatMap(m => m.tools?.map(t => t.id) || []));
  const remoteOnlyTools = sync.sharedTools.filter(st => !localToolIds.has(st.id));

  // Listen for remote commands (e.g. from mobile remote)
  useEffect(() => {
    const handleRemoteCommand = (e: CustomEvent) => {
      const { type, params } = e.detail;

      if (type === "create-tool") {
        processInput(`create a ${params.type} ${params.topic ? `about ${params.topic}` : ""}`);
      } else if (type === "rotate-3d") {
        // Find last 3D tool
        const lastToolID = messages.slice().reverse().find(m =>
          m.tools?.some(t => t.type.includes("3D") || t.type === "dataCube" || t.type === "globe3D")
        )?.tools?.[0]?.id;

        if (lastToolID) {
          // We can't update props directly via sync yet, but we can trigger a re-render or local update
          // For now, this is a limitation until we add full state sync
          // A better approach would be to broadcast a "tool-update" event
          console.log("3D rotation received", params);
        }
      }
    };

    window.addEventListener("remote-command" as any, handleRemoteCommand);
    return () => window.removeEventListener("remote-command" as any, handleRemoteCommand);
  }, [messages, sync]);

  // Listen for Supabase remote commands (for mobile compatibility)
  useEffect(() => {
    if (!roomName) return;
    const channel = supabase.channel(`canvas-${roomName}`);
    const sub = channel
      .on("broadcast", { event: "remote-command" }, ({ payload }) => {
        // Dispatch to the same handler above
        window.dispatchEvent(new CustomEvent("remote-command", { detail: payload }));
      })
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [roomName]);


  const processInput = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message || data.reply || "Here's what I generated based on your request.",
        tools: data.tools || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);


      if (data.tools && sync.isConnected) {
        data.tools.forEach((tool: ToolData) => {
          sync.sendTool({
            id: tool.id,
            type: tool.type,
            props: tool.props,
          });
        });
      }
    } catch (error) {
      console.error("Backend error, using intent engine fallback:", error);


      const intent = parseIntent(text);
      if (intent.type !== "none") {
        const tool: ToolData = {
          id: Math.random().toString(36).substr(2, 9),
          type: intent.type as ToolType,
          props: intent.params
        };

        const assistantMessage: Message = {
          role: "assistant",
          content: `I've prepared a ${intent.type} for you.`,
          tools: [tool]
        };

        setMessages(prev => [...prev, assistantMessage]);
        if (sync.isConnected) {
          sync.sendTool(tool);
        }
      } else {
        toast.error("Failed to connect to AI service");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const workbenchContent = (
    <div className="space-y-4">
      {messages.length === 0 && !isProcessing && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="h-8 w-8 text-primary mb-4" />
          <p className="text-sm text-muted-foreground max-w-xs">
            Ask Tambo to create maps, diagrams, polls, timers, charts, 3D globes, and more
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2 max-w-xs">
            Enable "Auto" mode for continuous voice transcription
          </p>
          <div className="flex flex-wrap gap-2 mt-4 max-w-sm justify-center">
            {["Timer", "Poll", "Chart", "Map", "Globe", "Scoreboard"].map((example) => (
              <button
                key={example}
                onClick={() => setInput(`Create a ${example.toLowerCase()}`)}
                className="px-2 py-1 text-xs bg-muted rounded-md hover:bg-muted/80 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "animate-fade-in",
            message.role === "user" ? "flex justify-end" : ""
          )}
        >
          {message.role === "user" ? (
            <div className="glass-panel rounded-lg px-3 py-2 max-w-[80%]">
              <p className="text-sm text-foreground">{message.content}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">{message.content}</p>
              </div>
              {message.tools && message.tools.length > 0 && (
                <div className="space-y-3 pl-6">
                  {message.tools.map((tool, toolIndex) => (
                    <ToolComponent
                      key={tool.id}
                      tool={tool}
                      onEvent={handleToolEvent(tool.id, tool.type)}
                      isChainActive={activeChainId !== null}
                      animationDelay={toolIndex * 150}
                      onDelete={() => deleteTool(tool.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {isProcessing && (
        <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Generating tools</span>
        </div>
      )}

      {remoteOnlyTools.length > 0 && (
        <div className="space-y-3 border-t border-border pt-4 mt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>Shared by others</span>
          </div>
          {remoteOnlyTools.map((sharedTool, idx) => (
            <ToolComponent
              key={sharedTool.id}
              tool={{
                id: sharedTool.id,
                type: sharedTool.type as ToolType,
                props: sharedTool.props as any,
              }}
              onEvent={handleToolEvent(sharedTool.id, sharedTool.type)}
              isChainActive={activeChainId !== null}
              animationDelay={idx * 150}
            />
          ))}
        </div>
      )}
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processInput(input);
  };

  const remoteUrl = `${window.location.origin}/remote/${roomName || "dendro-meet"}`;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Tambo Workbench</span>

        <div className="ml-auto flex items-center gap-3">


          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-400 hover:text-emerald-400">
                <Smartphone className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Remote</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-950 border-emerald-500/20" aria-describedby="remote-dialog-description">
              <DialogHeader>
                <DialogTitle className="text-emerald-500 uppercase tracking-widest text-sm flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Presentation Node
                </DialogTitle>
                <p id="remote-dialog-description" className="text-xs text-slate-400">
                  Scan QR code to control the workbench from your phone.
                </p>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-6 gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <QRCodeSVG value={remoteUrl} size={200} level="H" includeMargin />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-200 font-medium">Scan with your phone</p>
                  <p className="text-xs text-slate-500">Rotate 3D tools and actuate quick commands directly from your device.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant={showTranscript ? "default" : "ghost"}
            className="h-7 px-2"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            <Mic className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Auto</span>
          </Button>

          {sync.isConnected && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs">Live</span>
            </div>
          )}
        </div>
      </div>


      {showTranscript ? (
        <ResizablePanelGroup direction="vertical" className="flex-1 md:flex-col">
          <ResizablePanel defaultSize={25} minSize={10} className="bg-background/50 hidden md:block">
            <TranscriptPanel
              onTranscript={processInput}
            />
          </ResizablePanel>
          <ResizableHandle className="h-1 bg-border hover:bg-primary/50 transition-colors cursor-row-resize hidden md:flex" />
          <ResizablePanel defaultSize={75} minSize={30}>
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              {workbenchContent}
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {workbenchContent}
        </ScrollArea>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <MagicMic onTranscript={processInput} disabled={isProcessing} />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Create a timer, poll, chart, 3D globe..."
            className="flex-1"
            disabled={isProcessing}
          />
          <Button type="submit" size="sm" disabled={isProcessing}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default GenerativeCanvas;
