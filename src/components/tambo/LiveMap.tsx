import { useEffect, useState, useRef } from "react";
import { MapPin } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

interface Marker {
  lat: number;
  lng: number;
  label: string;
}

interface LiveMapProps {
  markers: Marker[];
  onMarkerClick?: (marker: Marker) => void;
}

export function LiveMap({ markers, onMarkerClick }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const initMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const center: [number, number] =
        markers.length > 0
          ? [markers[0].lat, markers[0].lng]
          : [51.505, -0.09];

      const map = L.map(mapRef.current!, {
        center,
        zoom: markers.length === 1 ? 13 : 4,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      markers.forEach((marker) => {
        const m = L.marker([marker.lat, marker.lng])
          .addTo(map)
          .bindPopup(marker.label);
        m.on("click", () => {
          onMarkerClickRef.current?.(marker);
        });
      });

      leafletMapRef.current = map;
      setIsLoaded(true);
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !isLoaded) return;

    const L = (window as any).L;
    if (!L) return;

    leafletMapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        leafletMapRef.current!.removeLayer(layer);
      }
    });

    markers.forEach((marker) => {
      const m = L.marker([marker.lat, marker.lng])
        .addTo(leafletMapRef.current!)
        .bindPopup(marker.label);
      m.on("click", () => {
        onMarkerClickRef.current?.(marker);
      });
    });

    if (markers.length > 0) {
      leafletMapRef.current.setView([markers[0].lat, markers[0].lng], markers.length === 1 ? 13 : 4);
    }
  }, [markers, isLoaded]);

  return (
    <div className="tool-card rounded-lg overflow-hidden h-64 w-full animate-fade-in">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Live Map</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {markers.length} location{markers.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="h-56 relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Loading map</span>
            </div>
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" style={{ background: "#0a0a0a" }} />
      </div>
    </div>
  );
}

export default LiveMap;