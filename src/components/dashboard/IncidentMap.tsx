import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from '../Icon';
import { useIncidents } from '../../hooks/useIncidents';
import { TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION } from '../../constants/map';

interface IncidentMapProps {
  readonly showHeader?: boolean;
  readonly expandTo?: string;
  readonly className?: string;
}

const pinIcon = L.divIcon({
  className: 'civiclens-map-pin',
  html: '<span class="material-symbols-outlined fill-icon" style="font-size:34px;line-height:34px;color:var(--color-primary);filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));font-variation-settings:&quot;FILL&quot; 1;">location_on</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

export const IncidentMap: React.FC<IncidentMapProps> = ({ showHeader = true, expandTo }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const { incidents, status, refetch } = useIncidents();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([23.0225, 72.5714], 12);
    L.tileLayer(TILE_LAYER_URL, {
      attribution: TILE_LAYER_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;
    mapRef.current = map;
    const timer = window.setTimeout(() => map.invalidateSize(), 150);
    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    incidents.forEach((incident) => {
      const marker = L.marker([incident.lat, incident.lng], { icon: pinIcon });
      marker.bindPopup(
        `<strong>${incident.title}</strong><br/><span>${incident.category} · ${incident.status}</span>`,
      );
      marker.addTo(layer);
    });
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(incidents.map((incident) => [incident.lat, incident.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    }
  }, [incidents]);

  return (
    <div className="bg-surface-bright rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-surface-container-highest overflow-hidden flex flex-col h-[400px]">
      {showHeader ? (
        <div className="p-4 border-b border-surface-container-highest flex justify-between items-center bg-surface">
          <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
            <Icon name="map" className="text-primary" />
            Live Incident Map
          </h3>
          {expandTo ? (
            <button
              className="text-primary font-label-sm text-label-sm"
              onClick={() => navigate(expandTo)}
            >
              Expand
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="flex-1 relative bg-surface-container-lowest z-0">
        <div ref={containerRef} className="w-full h-full" />
        {status === 'loading' ? (
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-[1px] flex items-center justify-center z-[500]">
            <div className="flex flex-col items-center gap-2">
              <Icon name="hourglass_top" className="text-3xl text-primary animate-spin" />
              <span className="font-label-sm text-label-sm text-on-surface-variant">Loading incidents…</span>
            </div>
          </div>
        ) : null}
        {status === 'error' ? (
          <div className="absolute inset-0 bg-surface/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 z-[500] px-6 text-center">
            <Icon name="cloud_off" className="text-3xl text-on-surface-variant" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              Couldn&apos;t load the live map. Is the server running?
            </p>
            <button
              onClick={refetch}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm shadow-sm hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
