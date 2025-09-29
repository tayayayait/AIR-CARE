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
}

const MapView: React.FC<MapViewProps> = ({
  coordinates,
  locationName,
  onRequestLocation,
  isLocating = false,
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

  return (
    <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-md">
      <div className="relative w-full h-full">
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
              'absolute right-3 bottom-3 rounded-full',
              'bg-white/90 backdrop-blur px-4 py-2 text-sm font-medium',
              'text-ink-strong shadow-lg hover:bg-white transition',
              isLocating ? 'cursor-not-allowed opacity-70' : '',
            ].join(' ')}
            disabled={isLocating}
          >
            {isLocating ? '위치 확인 중...' : '내 위치'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MapView;
