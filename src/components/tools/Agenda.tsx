import { useState } from "react";
import { CheckCircle2, Circle, ListTodo, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgendaItem {
  id: string;
  title: string;
  duration?: number; // minutes
  completed?: boolean;
}

interface AgendaProps {
  title?: string;
  items: AgendaItem[];
  onItemToggle?: (id: string, completed: boolean) => void;
  className?: string;
}

export function Agenda({
  title = "Meeting Agenda",
  items: initialItems,
  onItemToggle,
  className,
}: AgendaProps) {
  const [items, setItems] = useState(initialItems);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    const item = items.find((i) => i.id === id);
    if (item) {
      onItemToggle?.(id, !item.completed);
    }
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalDuration = items.reduce((sum, item) => sum + (item.duration || 0), 0);

  return (
    <div className={cn("tool-card rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {completedCount}/{items.length}
          </span>
          {totalDuration > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{totalDuration} min</span>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="max-h-64">
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50",
                item.completed && "bg-muted/30"
              )}
              onClick={() => handleToggle(item.id)}
            >
              <span className="text-xs text-muted-foreground w-5 shrink-0">
                {index + 1}.
              </span>

              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}

              <span
                className={cn(
                  "flex-1 text-sm",
                  item.completed && "line-through text-muted-foreground"
                )}
              >
                {item.title}
              </span>

              {item.duration && (
                <span className="text-xs text-muted-foreground">
                  {item.duration} min
                </span>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default Agenda;
