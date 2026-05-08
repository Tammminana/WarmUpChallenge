/**
 * WeatherWidget.jsx
 * Shows weather icon + temperature for the trip destination & date.
 * Hover tooltip shows AQI, UV Index, wind, humidity, precipitation.
 */
import { useState } from 'react';
import { Loader2, Wind, Droplets, Sun, AlertCircle } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { getWeatherIcon, getUVLabel, getAQILabel } from '../utils/weatherUtils';
import styles from './WeatherWidget.module.css';

export default function WeatherWidget({ destination, date, compact = false }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { weather, loading, error } = useWeather(destination, date);

  if (!destination || destination.trim().length < 2) return null;

  if (loading) {
    return (
      <div className={`${styles.widget} ${compact ? styles.compact : ''}`} aria-label="Loading weather">
        <Loader2 size={14} className={styles.spinner} aria-hidden="true" />
        <span className={styles.loadingText}>Weather…</span>
      </div>
    );
  }

  if (error || !weather) return null;

  const icon = getWeatherIcon(weather.weatherCode);
  const uvInfo = getUVLabel(weather.uvMax);
  const aqiInfo = weather.aqi ? getAQILabel(weather.aqi.aqi) : null;
  const dateLabel = date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today';

  return (
    <div
      className={`${styles.widget} ${compact ? styles.compact : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="button"
      aria-label={`Weather in ${weather.city}: ${icon.label}, ${Math.round(weather.tempMax)}°C high`}
      aria-haspopup="true"
      aria-expanded={showTooltip}
    >
      {/* Summary pill */}
      <span className={styles.emoji} aria-hidden="true">{icon.emoji}</span>
      <span className={styles.temp}>
        {Math.round(weather.tempMax)}°C
      </span>
      {!compact && (
        <span className={styles.condition}>{icon.label}</span>
      )}

      {/* Hover tooltip */}
      {showTooltip && (
        <div className={styles.tooltip} role="tooltip">
          <div className={styles.tooltipHeader}>
            <span className={styles.tooltipEmoji}>{icon.emoji}</span>
            <div>
              <strong className={styles.tooltipCity}>{weather.city}</strong>
              <span className={styles.tooltipDate}>{dateLabel}</span>
            </div>
          </div>

          <div className={styles.tooltipGrid}>
            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>High / Low</span>
              <span className={styles.tooltipVal}>
                {Math.round(weather.tempMax)}° / {Math.round(weather.tempMin)}°C
              </span>
            </div>

            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>Condition</span>
              <span className={styles.tooltipVal}>{icon.label}</span>
            </div>

            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>
                <Wind size={11} aria-hidden="true" /> Wind
              </span>
              <span className={styles.tooltipVal}>{weather.windSpeed} km/h</span>
            </div>

            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>
                <Droplets size={11} aria-hidden="true" /> Humidity
              </span>
              <span className={styles.tooltipVal}>{weather.humidity}%</span>
            </div>

            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>Rain</span>
              <span className={styles.tooltipVal}>{weather.precipitation} mm</span>
            </div>

            <div className={styles.tooltipItem}>
              <span className={styles.tooltipLabel}>
                <Sun size={11} aria-hidden="true" /> UV Index
              </span>
              <span className={styles.tooltipVal} style={{ color: uvInfo.color }}>
                {weather.uvMax ?? 'N/A'} — {uvInfo.label}
              </span>
            </div>

            {aqiInfo && (
              <div className={`${styles.tooltipItem} ${styles.fullWidth}`}>
                <span className={styles.tooltipLabel}>
                  <AlertCircle size={11} aria-hidden="true" /> Air Quality (AQI)
                </span>
                <span className={styles.tooltipVal} style={{ color: aqiInfo.color }}>
                  {weather.aqi.aqi} — {aqiInfo.label}
                  {weather.aqi.pm25 != null && ` · PM2.5: ${weather.aqi.pm25}μg`}
                </span>
              </div>
            )}
          </div>

          <p className={styles.tooltipSource}>via Open-Meteo · free weather data</p>
        </div>
      )}
    </div>
  );
}
