import React, { useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import type { Coordinates } from '../types';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  coordinates?: Coordinates | null;
  locationName?: string;
  onRequestLocation?: () => void;
  isLocating?: boolean;
  isExpanded?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  coordinates,
  locationName,
  onRequestLocation,
  isLocating = false,
  isExpanded = true,
}) => {
  const mapRef = useRef<L.Map | null>(null);

  const handleMapCreated = useCallback((mapInstance: L.Map) => {
    mapRef.current = mapInstance;

    const koreaBounds = L.latLngBounds(
      [33.1, 124.5],
      [38.8, 131.9],
    );

    mapInstance.fitBounds(koreaBounds, { padding: [24, 24], animate: true });
  }, []);

  useEffect(() => {
    if (!coordinates || !mapRef.current) return;

    const { latitude, longitude } = coordinates;
    mapRef.current.flyTo([latitude, longitude], 13, {
      animate: true,
      duration: 2,
    });
  }, [coordinates]);

  useEffect(() => {
    if (!mapRef.current) return;
    const mapInstance = mapRef.current;
    const timeout = window.setTimeout(() => {
      mapInstance.invalidateSize();
    }, 240);

    return () => window.clearTimeout(timeout);
  }, [isExpanded]);

  return (
    <div
      className={[
        'relative w-full h-full rounded-3xl overflow-hidden shadow-xl border border-white/10',
        'bg-background/90 backdrop-blur supports-backdrop-blur:bg-background/70 transition-colors',
      ].join(' ')}
    >
      <div className="absolute inset-0">
        <MapContainer
          center={[36.5, 127.5]}
          zoom={7}
          className="w-full h-full"
          scrollWheelZoom
          zoomControl
          whenCreated={handleMapCreated}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          {coordinates && (
            <Marker position={[coordinates.latitude, coordinates.longitude]} icon={defaultIcon}>
              <Popup>
                {locationName || '선택한 위치'}<br />
                위도 {coordinates.latitude.toFixed(4)}, 경도 {coordinates.longitude.toFixed(4)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
        {onRequestLocation && (
          <button
            type="button"
            onClick={onRequestLocation}
            className={[
              'absolute right-4 bottom-4 h-14 w-14 rounded-full shadow-xl',
              'bg-gradient-to-br from-primary-soft to-secondary-soft text-ink-strong font-semibold',
              'hover:from-primary-soft/90 hover:to-secondary-soft/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40',
              isLocating ? 'cursor-not-allowed opacity-70' : '',
            ].join(' ')}
            disabled={isLocating}
            aria-label="내 위치로 이동"
          >
            {isLocating ? '로딩' : '내 위치'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MapView;
