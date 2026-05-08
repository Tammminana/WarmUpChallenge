/**
 * useWeather.js — React hook for fetching weather + AQI for a city and date
 * Uses Open-Meteo (free, no API key required)
 */
import { useState, useEffect, useRef } from 'react';
import { getWeatherData } from '../utils/weatherUtils';

const cache = new Map(); // in-memory cache keyed by "city|date"

export function useWeather(city, date) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!city || city.trim().length < 2) {
      setWeather(null);
      setError(null);
      return;
    }

    const cityName = city.split(',')[0].trim(); // Use first part e.g. "Goa" from "Goa, India"
    // Normalize date to YYYY-MM-DD
    let targetDate = null;
    if (date) {
      try {
        targetDate = new Date(date).toISOString().split('T')[0];
      } catch {
        targetDate = null;
      }
    }

    const cacheKey = `${cityName.toLowerCase()}|${targetDate || 'today'}`;

    // Return cached result immediately
    if (cache.has(cacheKey)) {
      setWeather(cache.get(cacheKey));
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancel previous in-flight request
    if (abortRef.current) {
      abortRef.current = false;
    }
    const controller = { active: true };
    abortRef.current = controller;

    getWeatherData(cityName, targetDate)
      .then((data) => {
        if (!controller.active) return;
        cache.set(cacheKey, data);
        setWeather(data);
        setError(null);
      })
      .catch((err) => {
        if (!controller.active) return;
        setError(err.message);
        setWeather(null);
      })
      .finally(() => {
        if (controller.active) setLoading(false);
      });

    return () => {
      controller.active = false;
    };
  }, [city, date]);

  return { weather, loading, error };
}
