import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from '../Icon';
import { reverseGeocode } from '../../api/geocode';
import { TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION } from '../../constants/map';
import type { ReportCoordinates } from '../../hooks/useReportForm';

interface LocationSectionProps {
  readonly address: string;
  readonly onAddressChange: (value: string) => void;
  readonly coordinates: ReportCoordinates;
  readonly onCoordinatesChange: (coords: ReportCoordinates) => void;
}

const pinIcon = L.divIcon({
  className: 'civiclens-map-pin',
  html: '<span class="material-symbols-outlined fill-icon" style="font-size:40px;line-height:40px;color:var(--color-primary);filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));font-variation-settings:&quot;FILL&quot; 1;">location_on</span>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export const LocationSection: React.FC<LocationSectionProps> = ({
  address,
  onAddressChange,
  coordinates,
  onCoordinatesChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
      [coordinates.lat, coordinates.lng],
      13,
    );
    L.tileLayer(TILE_LAYER_URL, {
      attribution: TILE_LAYER_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    const marker = L.marker([coordinates.lat, coordinates.lng], { icon: pinIcon, draggable: true }).addTo(map);
    markerRef.current = marker;
    mapRef.current = map;

    map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      marker.setLatLng([lat, lng]);
      onCoordinatesChange({ lat, lng });
    });
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      onCoordinatesChange({ lat: position.lat, lng: position.lng });
    });

    const timer = window.setTimeout(() => map.invalidateSize(), 200);
    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
    mapRef.current.setView([coordinates.lat, coordinates.lng], mapRef.current.getZoom());
  }, [coordinates.lat, coordinates.lng]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCoordinatesChange({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        // Geolocation unavailable or denied: keep current coordinates.
      },
    );
  };

  const zoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const getAddressFromMap = async () => {
    if (lookingUp) return;
    setLookingUp(true);
    setLookupError(null);
    try {
      const displayName = await reverseGeocode(coordinates.lat, coordinates.lng);
      onAddressChange(displayName);
    } catch {
      setLookupError('Could not look up this location. Please type the address.');
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] p-gutter border border-outline-variant/30 flex flex-col gap-4">
      <h2 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
        <Icon name="location_on" className="text-primary" />
        Incident Location
      </h2>
      <div className="w-full h-48 rounded-lg overflow-hidden border border-outline-variant relative z-0">
        <div ref={containerRef} className="w-full h-full" />
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[500]">
          <button
            type="button"
            onClick={useMyLocation}
            aria-label="Use my location"
            className="bg-surface-container-lowest p-2 rounded-full shadow-md text-on-surface hover:text-primary transition-colors"
          >
            <Icon name="my_location" />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            aria-label="Zoom in"
            className="bg-surface-container-lowest p-2 rounded-full shadow-md text-on-surface hover:text-primary transition-colors"
          >
            <Icon name="add" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-label-sm text-label-sm text-on-surface" htmlFor="address">
          Street Address
        </label>
        <div className="relative">
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 pr-10 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-on-surface-variant/50"
            id="address"
            placeholder="Enter nearest address or intersection"
            type="text"
            value={address}
            onChange={(event) => {
              setLookupError(null);
              onAddressChange(event.target.value);
            }}
          />
          <button
            type="button"
            onClick={() => void getAddressFromMap()}
            disabled={lookingUp}
            aria-label="Get address from map location"
            title="Fill the address from the map pin"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-on-surface-variant hover:text-primary transition-colors disabled:opacity-60"
          >
            <Icon name={lookingUp ? 'progress_activity' : 'edit_location'} className={lookingUp ? 'animate-spin' : ''} />
          </button>
        </div>
        {lookupError ? (
          <p className="font-label-sm text-label-sm text-error mt-1">{lookupError}</p>
        ) : null}
      </div>
    </section>
  );
};
