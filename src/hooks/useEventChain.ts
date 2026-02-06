import { useState, useCallback, useRef } from "react";

export interface ChainRule {
  id: string;
  sourceTool: string;
  sourceEvent: string;
  targetToolType: "map" | "chart" | "poll";
  transform: (sourceData: any) => any;
  description: string;
}

interface ChainEvent {
  toolId: string;
  eventType: string;
  data: any;
  timestamp: number;
}

const DEFAULT_CHAIN_RULES: ChainRule[] = [
  {
    id: "poll-to-chart",
    sourceTool: "poll",
    sourceEvent: "vote",
    targetToolType: "chart",
    description: "Poll results generate a pie chart",
    transform: (data: { question: string; results: { option: string; votes: number }[] }) => ({
      chartDef: `pie title ${data.question}
 ${data.results.map(r => `    "${r.option}" : ${r.votes}`).join("\n")}`,
    }),
  },
  {
    id: "chart-to-poll",
    sourceTool: "chart",
    sourceEvent: "node-click",
    targetToolType: "poll",
    description: "Clicking a chart node creates a decision poll",
    transform: (data: { nodeLabel: string }) => ({
      question: `What action should we take on "${data.nodeLabel}"?`,
      options: ["Proceed", "Review", "Skip", "Discuss more"],
    }),
  },
  {
    id: "map-to-poll",
    sourceTool: "map",
    sourceEvent: "marker-click",
    targetToolType: "poll",
    description: "Clicking a map marker creates a location poll",
    transform: (data: { label: string }) => ({
      question: `Should we include "${data.label}" in our plan?`,
      options: ["Yes", "No", "Maybe", "Need more info"],
    }),
  },
];

export function useEventChain(
  onChainTriggered?: (targetType: string, props: any, rule: ChainRule) => void
) {
  const [chainRules] = useState<ChainRule[]>(DEFAULT_CHAIN_RULES);
  const [pendingChains, setPendingChains] = useState<ChainEvent[]>([]);
  const [activeChainId, setActiveChainId] = useState<string | null>(null);
  const chainTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const emitEvent = useCallback((toolId: string, toolType: string, eventType: string, data: any) => {
    const matchingRule = chainRules.find(
      rule => rule.sourceTool === toolType && rule.sourceEvent === eventType
    );

    if (matchingRule) {
      setActiveChainId(matchingRule.id);


      if (chainTimeoutRef.current) clearTimeout(chainTimeoutRef.current);

      chainTimeoutRef.current = setTimeout(() => {
        const transformedProps = matchingRule.transform(data);
        onChainTriggered?.(matchingRule.targetToolType, transformedProps, matchingRule);

        setPendingChains(prev => [...prev, {
          toolId,
          eventType,
          data,
          timestamp: Date.now(),
        }]);


        setTimeout(() => setActiveChainId(null), 500);
      }, 800);
    }
  }, [chainRules, onChainTriggered]);

  const cancelPendingChain = useCallback(() => {
    if (chainTimeoutRef.current) {
      clearTimeout(chainTimeoutRef.current);
      setActiveChainId(null);
    }
  }, []);

  return {
    chainRules,
    pendingChains,
    activeChainId,
    emitEvent,
    cancelPendingChain,
  };
}