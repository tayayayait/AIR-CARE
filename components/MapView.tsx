import React from 'react';
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
  coordinates: Coordinates;
  locationName?: string;
}

const MapView: React.FC<MapViewProps> = ({ coordinates, locationName }) => {
  const { latitude, longitude } = coordinates;

  return (
    <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden shadow-md">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        className="w-full h-full"
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <Marker position={[latitude, longitude]} icon={defaultIcon}>
          <Popup>
            {locationName || '선택한 위치'}<br />
            위도 {latitude.toFixed(4)}, 경도 {longitude.toFixed(4)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
