import { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import styles from '../pages/Planner.module.css';

// Using @vis.gl/react-google-maps for deep Google Services integration
export default function MapEmbed({ destination }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [position, setPosition] = useState(null); // { lat, lng }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destination || !apiKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Use Geocoding API to get lat/lng for the destination
    // Since we are loading the SDK via APIProvider, we can use window.google once loaded
    // However, for immediate geocoding we can use the fetch fallback or a hook.
    // Let's use a fetch to the Geocoding API directly for simplicity in the effect
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`)
      .then(r => r.json())
      .then(data => {
        if (data.results?.[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          setPosition({ lat, lng });
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to OSM coordinates if Google Geocoding fails (e.g. key restrictions)
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`)
          .then(r => r.json())
          .then(data => {
            if (data?.[0]) {
              setPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, [destination, apiKey]);

  if (!apiKey) {
    return (
      <div className={styles.mapContainer}>
        <p className={styles.mapFallback}>Maps API key not configured.</p>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <MapPin size={14} aria-hidden="true" />
        <span>{destination}</span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapLink}
        >
          <ExternalLink size={12} /> Open Map
        </a>
      </div>

      <div className={styles.mapIframeWrapper} style={{ height: '250px', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
        {loading ? (
          <div className={styles.mapLoading} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
            <Loader2 className="spinner" size={24} />
            <span>Loading Google Maps…</span>
          </div>
        ) : position ? (
          <APIProvider apiKey={apiKey}>
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={position}
              defaultZoom={13}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              mapId="DEMO_MAP_ID" // Advanced markers require a Map ID
            >
              <AdvancedMarker position={position}>
                <Pin background={'#0d9488'} glyphColor={'#fff'} borderColor={'#0f766e'} />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className={styles.mapFallback} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            Map unavailable for this location.
          </div>
        )}
      </div>
    </div>
  );
}
