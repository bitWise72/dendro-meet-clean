import { ReactNode, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface OverlayContainerProps {
  children: ReactNode;
  className?: string;
}

export function OverlayContainer({ children, className }: OverlayContainerProps) {
  // Render to a portal that overlays the entire viewport
  return createPortal(
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-40",
        className
      )}
    >
      {children}
    </div>,
    document.body
  );
}

export default OverlayContainer;
