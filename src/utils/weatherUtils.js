/**
 * weatherUtils.js — Fetches weather data using Open-Meteo (free, no API key)
 * Geocoding via Open-Meteo Geocoding API
 */

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const AQI_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * WMO Weather Code → emoji + label
 */
export const WMO_CODES = {
  0: { emoji: '☀️', label: 'Clear sky' },
  1: { emoji: '🌤️', label: 'Mainly clear' },
  2: { emoji: '⛅', label: 'Partly cloudy' },
  3: { emoji: '☁️', label: 'Overcast' },
  45: { emoji: '🌫️', label: 'Foggy' },
  48: { emoji: '🌫️', label: 'Icy fog' },
  51: { emoji: '🌦️', label: 'Light drizzle' },
  53: { emoji: '🌦️', label: 'Drizzle' },
  55: { emoji: '🌧️', label: 'Heavy drizzle' },
  61: { emoji: '🌧️', label: 'Light rain' },
  63: { emoji: '🌧️', label: 'Rain' },
  65: { emoji: '🌧️', label: 'Heavy rain' },
  71: { emoji: '🌨️', label: 'Light snow' },
  73: { emoji: '🌨️', label: 'Snow' },
  75: { emoji: '❄️', label: 'Heavy snow' },
  80: { emoji: '🌦️', label: 'Rain showers' },
  81: { emoji: '🌧️', label: 'Rain showers' },
  82: { emoji: '⛈️', label: 'Violent showers' },
  95: { emoji: '⛈️', label: 'Thunderstorm' },
  96: { emoji: '⛈️', label: 'Thunderstorm + hail' },
  99: { emoji: '⛈️', label: 'Heavy thunderstorm' },
};

export function getWeatherIcon(code) {
  return WMO_CODES[code] || { emoji: '🌡️', label: 'Unknown' };
}

/**
 * UV Index → label + color
 */
export function getUVLabel(uv) {
  if (uv == null) return { label: 'N/A', color: '#888' };
  if (uv <= 2) return { label: 'Low', color: '#4ade80' };
  if (uv <= 5) return { label: 'Moderate', color: '#facc15' };
  if (uv <= 7) return { label: 'High', color: '#fb923c' };
  if (uv <= 10) return { label: 'Very High', color: '#f87171' };
  return { label: 'Extreme', color: '#c084fc' };
}

/**
 * AQI → label + color
 */
export function getAQILabel(aqi) {
  if (aqi == null) return { label: 'N/A', color: '#888' };
  if (aqi <= 50) return { label: 'Good', color: '#4ade80' };
  if (aqi <= 100) return { label: 'Moderate', color: '#facc15' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: '#fb923c' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#f87171' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#c084fc' };
  return { label: 'Hazardous', color: '#ef4444' };
}

/**
 * Geocode a city name → { lat, lon, name }
 */
export async function geocodeCity(cityName) {
  const res = await fetch(`${GEO_API}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (!data.results?.length) throw new Error(`City not found: ${cityName}`);
  const { latitude: lat, longitude: lon, name, country } = data.results[0];
  return { lat, lon, name, country };
}

/**
 * Fetch weather for given lat/lon on a specific date (YYYY-MM-DD).
 * If no date, uses today.
 * Returns: { temp, tempMax, tempMin, weatherCode, uvMax, humidity, windSpeed, precipitation }
 */
export async function fetchWeatherForDate(lat, lon, date) {
  const today = new Date().toISOString().split('T')[0];
  const targetDate = date || today;

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: 'temperature_2m_max,temperature_2m_min,weathercode,uv_index_max,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max',
    timezone: 'auto',
    start_date: targetDate,
    end_date: targetDate,
  });

  const res = await fetch(`${WEATHER_API}?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();

  const d = data.daily;
  return {
    date: targetDate,
    tempMax: d.temperature_2m_max?.[0],
    tempMin: d.temperature_2m_min?.[0],
    weatherCode: d.weathercode?.[0],
    uvMax: d.uv_index_max?.[0],
    precipitation: d.precipitation_sum?.[0],
    windSpeed: d.windspeed_10m_max?.[0],
    humidity: d.relative_humidity_2m_max?.[0],
  };
}

/**
 * Fetch AQI for lat/lon on date
 * Returns: { aqi, pm25, pm10 }
 */
export async function fetchAQIForDate(lat, lon, date) {
  const today = new Date().toISOString().split('T')[0];
  const targetDate = date || today;

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: 'pm2_5,pm10,european_aqi',
    timezone: 'auto',
    start_date: targetDate,
    end_date: targetDate,
  });

  try {
    const res = await fetch(`${AQI_API}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const aqiArr = data.hourly?.european_aqi || [];
    const pm25Arr = data.hourly?.pm2_5 || [];
    const pm10Arr = data.hourly?.pm10 || [];
    // Average midday readings (hours 10-14)
    const slice = (arr) => arr.slice(10, 15).filter(v => v != null);
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    return {
      aqi: Math.round(avg(slice(aqiArr))),
      pm25: Math.round(avg(slice(pm25Arr)) * 10) / 10,
      pm10: Math.round(avg(slice(pm10Arr))),
    };
  } catch {
    return null;
  }
}

/**
 * Full weather data for a city + date combo
 */
export async function getWeatherData(cityName, date) {
  const { lat, lon, name, country } = await geocodeCity(cityName);
  const [weather, aqiData] = await Promise.all([
    fetchWeatherForDate(lat, lon, date),
    fetchAQIForDate(lat, lon, date),
  ]);
  return { ...weather, city: name, country, aqi: aqiData };
}
