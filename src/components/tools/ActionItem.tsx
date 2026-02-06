import { useState } from "react";
import { CheckCircle2, Circle, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItemProps {
  title: string;
  assignee?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
  onToggle?: (completed: boolean) => void;
  className?: string;
  overlay?: boolean;
}

export function ActionItem({
  title,
  assignee,
  dueDate,
  priority = "medium",
  completed: initialCompleted = false,
  onToggle,
  className,
  overlay = false,
}: ActionItemProps) {
  const [completed, setCompleted] = useState(initialCompleted);

  const handleToggle = () => {
    const newState = !completed;
    setCompleted(newState);
    onToggle?.(newState);
  };

  const priorityColors = {
    low: "border-l-muted-foreground",
    medium: "border-l-primary",
    high: "border-l-destructive",
  };

  return (
    <div
      className={cn(
        "tool-card rounded-lg p-3 border-l-4 cursor-pointer transition-all",
        priorityColors[priority],
        completed && "opacity-60",
        overlay && "bg-card/80 backdrop-blur-md",
        className
      )}
      onClick={handleToggle}
    >
      <div className="flex items-start gap-3">
        <button className="shrink-0 mt-0.5">
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium",
              completed && "line-through text-muted-foreground"
            )}
          >
            {title}
          </p>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {assignee && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{assignee}</span>
              </div>
            )}
            {dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{dueDate}</span>
              </div>
            )}
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium",
                priority === "high" && "bg-destructive/20 text-destructive",
                priority === "medium" && "bg-primary/20 text-primary",
                priority === "low" && "bg-muted text-muted-foreground"
              )}
            >
              {priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActionItem;
