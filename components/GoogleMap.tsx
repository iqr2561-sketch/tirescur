import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  address?: string;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  zoom = 15,
  address,
  className = 'w-full h-96 rounded-lg',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    // Verificar si Google Maps está cargado
    if (!window.google || !window.google.maps) {
      // Cargar Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current || !window.google) return;

      // Crear mapa
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Crear marcador
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: address || 'Ubicación',
        animation: window.google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      // Crear ventana de información
      if (address) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${address}</strong></div>`,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }
    }

    return () => {
      // Cleanup
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [latitude, longitude, zoom, address]);

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!window.google && (
        <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
        </div>
      )}
    </div>
  );
};

// Extender Window interface para TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
}

export default GoogleMap;

