"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

export interface LocationValue {
  label: string;
  latitude: number | null;
  longitude: number | null;
}

// Centre par défaut : Cotonou.
const DEFAULT_CENTER: [number, number] = [6.3703, 2.3912];

// Icône construite en SVG inline : évite les soucis de chemins d'images
// Leaflet sous le bundler Next.
const pinIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21c0-7.18-5.82-13-13-13z" fill="${color}"/>
      <circle cx="13" cy="13" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
  });

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

/** Force Leaflet à recalculer sa taille quand la carte apparaît dans une modale animée. */
function ResizeOnMount() {
  const map = useMapEvents({});
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

interface LocationPickerProps {
  title: string;
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  color?: string;
  placeholder?: string;
}

export default function LocationPicker({
  title,
  value,
  onChange,
  color = "#1f6feb",
  placeholder = "ex: Carrefour Toyota",
}: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  // Tant que l'admin n'a pas écrit lui-même, le géocodage inverse peut remplir le libellé.
  const labelTouched = useRef(false);
  const requestId = useRef(0);

  const icon = useMemo(() => pinIcon(color), [color]);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      const current = ++requestId.current;
      setIsLocating(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&zoom=17&accept-language=fr&lat=${lat}&lon=${lng}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (current !== requestId.current) return null;
        const a = data?.address || {};
        const parts = [
          a.road || a.pedestrian || a.neighbourhood || a.suburb,
          a.village || a.town || a.city || a.municipality,
        ].filter(Boolean);
        return parts.join(", ") || data?.display_name?.split(",").slice(0, 2).join(",") || null;
      } catch {
        // Le géocodage est un confort : en cas d'échec l'admin saisit le libellé.
        return null;
      } finally {
        if (current === requestId.current) setIsLocating(false);
      }
    },
    []
  );

  const handlePick = useCallback(
    async (lat: number, lng: number) => {
      const latitude = Number(lat.toFixed(6));
      const longitude = Number(lng.toFixed(6));
      onChange({ ...value, latitude, longitude });

      if (labelTouched.current && value.label.trim()) return;
      const found = await reverseGeocode(latitude, longitude);
      if (found) onChange({ label: found, latitude, longitude });
    },
    [onChange, reverseGeocode, value]
  );

  const hasPoint = value.latitude !== null && value.longitude !== null;

  return (
    <div className="space-y-2">
      <label className="overline mb-1 flex items-center gap-1.5">
        <MapPin size={13} style={{ color }} />
        {title}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value.label}
          onChange={(e) => {
            labelTouched.current = true;
            onChange({ ...value, label: e.target.value });
          }}
          placeholder={placeholder}
          className="field"
          required
        />
        {isLocating && (
          <Loader2
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted"
          />
        )}
      </div>

      <div className="overflow-hidden rounded-[12px] border border-line">
        <MapContainer
          center={hasPoint ? [value.latitude!, value.longitude!] : DEFAULT_CENTER}
          zoom={hasPoint ? 15 : 12}
          scrollWheelZoom
          style={{ height: 190, width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCatcher onPick={handlePick} />
          <ResizeOnMount />
          {hasPoint && (
            <Marker
              position={[value.latitude!, value.longitude!]}
              icon={icon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = (e.target as L.Marker).getLatLng();
                  handlePick(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-[11px] font-semibold text-muted">
        {hasPoint ? (
          <span className="tabular-nums">
            {value.latitude!.toFixed(5)}, {value.longitude!.toFixed(5)}
          </span>
        ) : (
          "Cliquez sur la carte pour placer le point."
        )}
      </p>
    </div>
  );
}
