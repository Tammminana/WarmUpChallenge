import { useState, useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import styles from '../pages/Planner.module.css';

// Google Maps embed (uses Maps Embed API — free tier)
export default function MapEmbed({ destination }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const [mapUrl, setMapUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destination) return;
    const city = destination.split(',')[0].trim();

    if (apiKey) {
      // Use Google Maps Embed API
      setMapUrl(`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(destination)}&zoom=12`);
      setLoading(false);
    } else {
      // Fallback to OpenStreetMap
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      })
        .then(r => r.json())
        .then(data => {
          if (data?.[0]) {
            const { lat, lon } = data[0];
            const bbox = `${parseFloat(lon) - 0.15},${parseFloat(lat) - 0.1},${parseFloat(lon) + 0.15},${parseFloat(lat) + 0.1}`;
            setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [destination, apiKey]);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <MapPin size={14} aria-hidden="true" />
        <span>{destination}</span>
        <a
          href={apiKey
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`
            : `https://www.openstreetmap.org/search?query=${encodeURIComponent(destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapLink}
          aria-label={`Open ${destination} on map`}
        >
          <ExternalLink size={12} /> Open Map
        </a>
      </div>
      {loading ? (
        <div className={styles.mapLoading}>
          <div className="spinner" aria-hidden="true" />
          <span>Loading map…</span>
        </div>
      ) : mapUrl ? (
        <iframe
          src={mapUrl}
          title={`Map of ${destination}`}
          className={styles.mapIframe}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          aria-label={`Interactive map showing ${destination}`}
        />
      ) : (
        <p className={styles.mapFallback}>Map unavailable for this location.</p>
      )}
    </div>
  );
}
