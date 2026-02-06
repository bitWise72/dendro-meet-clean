import { QRCodeSVG } from "qrcode.react";
import { Link2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QRCodeProps {
  url: string;
  title?: string;
  size?: number;
  className?: string;
  overlay?: boolean;
}

export function QRCode({
  url,
  title = "Scan to Join",
  size = 128,
  className,
  overlay = false,
}: QRCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div
      className={cn(
        "tool-card rounded-lg p-4 flex flex-col items-center",
        overlay && "bg-card/90 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3 self-start">
        <Link2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
      </div>

      <div className="bg-white p-3 rounded-lg">
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>

      <div className="mt-3 flex items-center gap-2 w-full">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate font-mono">
            {url}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 h-7 w-7 p-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default QRCode;
