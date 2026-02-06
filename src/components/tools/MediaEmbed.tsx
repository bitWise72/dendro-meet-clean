import { useState } from "react";
import { ExternalLink, Image as ImageIcon, Video, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MediaEmbedProps {
  url: string;
  type?: "youtube" | "image" | "link";
  title?: string;
  description?: string;
  thumbnail?: string;
  className?: string;
}

export function MediaEmbed({
  url,
  type = "link",
  title,
  description,
  thumbnail,
  className,
}: MediaEmbedProps) {
  const [imageError, setImageError] = useState(false);

  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
  };

  const youtubeId = type === "youtube" ? getYouTubeId(url) : null;

  const renderContent = () => {
    if (type === "youtube" && youtubeId) {
      return (
        <AspectRatio ratio={16 / 9}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        </AspectRatio>
      );
    }

    if (type === "image" && !imageError) {
      return (
        <AspectRatio ratio={16 / 9}>
          <img
            src={url}
            alt={title || "Embedded image"}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        </AspectRatio>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-muted/50 transition-colors rounded-lg"
      >
        <div className="flex gap-3">
          {thumbnail && !imageError ? (
            <div className="w-24 h-24 shrink-0">
              <img
                src={thumbnail}
                alt=""
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="w-24 h-24 shrink-0 bg-muted rounded-lg flex items-center justify-center">
              <Link2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0 py-1">
            <h4 className="text-sm font-medium text-foreground truncate">
              {title || url}
            </h4>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-primary">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{new URL(url).hostname}</span>
            </div>
          </div>
        </div>
      </a>
    );
  };

  const getIcon = () => {
    switch (type) {
      case "youtube":
        return <Video className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <Link2 className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("tool-card rounded-lg p-3", className)}>
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        {getIcon()}
        <span className="uppercase tracking-wide font-medium">
          {type === "youtube" ? "Video" : type === "image" ? "Image" : "Link"}
        </span>
      </div>
      {renderContent()}
    </div>
  );
}

export default MediaEmbed;
