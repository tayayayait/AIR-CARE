import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import type { Coordinates } from '../types';
import { LocationIcon } from './Icons';

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
  const [isExpanded, setIsExpanded] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 640 : true));
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));

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
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile) {
        setIsExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerHeight = useMemo(
    () => (isExpanded || !isMobile ? 'h-72 sm:h-96' : 'h-28 sm:h-96'),
    [isExpanded, isMobile],
  );

  const handleToggle = () => {
    if (!isMobile) return;
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={[
        'relative w-full overflow-hidden rounded-3xl border border-white/20 shadow-xl',
        'bg-gradient-to-br from-white/90 via-white/70 to-white/90 backdrop-blur-sm transition-all duration-300',
        containerHeight,
      ].join(' ')}
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:hidden">
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center justify-center w-16 h-6 rounded-full bg-dark-text/20 hover:bg-dark-text/30 transition-colors"
          aria-label={isExpanded ? '지도 축소' : '지도 확장'}
        >
          <span className="sr-only">{isExpanded ? '지도 축소' : '지도 확장'}</span>
          <div className="h-1.5 w-12 rounded-full bg-white/70" />
        </button>
      </div>
      <div className={`relative w-full h-full pt-6 sm:pt-0 transition-opacity duration-300 ${isExpanded || !isMobile ? 'opacity-100' : 'opacity-80'}`}>
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
              'absolute right-4 bottom-4 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold',
              'bg-gradient-to-r from-brand-blue to-brand-green text-white shadow-xl shadow-brand-blue/30',
              'hover:from-brand-green hover:to-brand-blue transition disabled:opacity-70 disabled:cursor-not-allowed',
            ].join(' ')}
            disabled={isLocating}
            aria-label="내 위치로 지도 이동"
          >
            <LocationIcon className="h-5 w-5" />
            <span>{isLocating ? '위치 확인 중…' : '내 위치'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MapView;
