import { useEffect, useRef, useState } from "react";
import { GitBranch } from "lucide-react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chartDef: string;
  onNodeClick?: (nodeLabel: string) => void;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#22c55e",
    primaryTextColor: "#fafafa",
    primaryBorderColor: "#27272a",
    lineColor: "#3f3f46",
    secondaryColor: "#18181b",
    tertiaryColor: "#27272a",
    background: "#0a0a0a",
    mainBkg: "#18181b",
    nodeBorder: "#3f3f46",
    clusterBkg: "#18181b",
    titleColor: "#fafafa",
    edgeLabelBackground: "#18181b",
  },
  fontFamily: "JetBrains Mono, monospace",
});

export function MermaidChart({ chartDef, onNodeClick }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  onNodeClickRef.current = onNodeClick;

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chartDef) return;

      try {
        containerRef.current.innerHTML = "";
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chartDef);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;

          // Add click handlers to nodes
          const nodes = containerRef.current.querySelectorAll(".node");
          nodes.forEach((node) => {
            node.addEventListener("click", () => {
              const label = node.querySelector(".nodeLabel")?.textContent || 
                            node.textContent?.trim() || "Unknown";
              onNodeClickRef.current?.(label);
            });
            (node as HTMLElement).style.cursor = "pointer";
          });
        }
        setError(null);
      } catch (err) {
        setError("Failed to render chart");
        console.error("Mermaid render error:", err);
      }
    };

    renderChart();
  }, [chartDef]);

  return (
    <div className="tool-card rounded-lg overflow-hidden animate-fade-in">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <GitBranch className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Chart</span>
      </div>
      <div className="p-4 min-h-32 flex items-center justify-center">
        {error ? (
          <span className="text-sm text-destructive">{error}</span>
        ) : (
          <div ref={containerRef} className="w-full overflow-x-auto" />
        )}
      </div>
    </div>
  );
}

export default MermaidChart;