/**
 * weatherUtils.test.js — Unit tests for weather utility functions
 * Tests pure functions only (no API calls)
 */
import { describe, it, expect } from 'vitest';
import { getWeatherIcon, getUVLabel, getAQILabel, WMO_CODES } from '../utils/weatherUtils';

describe('getWeatherIcon', () => {
  it('returns correct emoji and label for clear sky (code 0)', () => {
    const result = getWeatherIcon(0);
    expect(result.emoji).toBe('☀️');
    expect(result.label).toBe('Clear sky');
  });

  it('returns thunderstorm for code 95', () => {
    const result = getWeatherIcon(95);
    expect(result.emoji).toBe('⛈️');
    expect(result.label).toBe('Thunderstorm');
  });

  it('returns rain for code 63', () => {
    const result = getWeatherIcon(63);
    expect(result.emoji).toBe('🌧️');
  });

  it('returns snow for code 73', () => {
    const result = getWeatherIcon(73);
    expect(result.emoji).toBe('🌨️');
  });

  it('returns fallback for unknown code', () => {
    const result = getWeatherIcon(999);
    expect(result.emoji).toBe('🌡️');
    expect(result.label).toBe('Unknown');
  });

  it('has entries for all defined WMO codes', () => {
    Object.keys(WMO_CODES).forEach(code => {
      const result = getWeatherIcon(Number(code));
      expect(result.emoji).toBeTruthy();
      expect(result.label).toBeTruthy();
    });
  });
});

describe('getUVLabel', () => {
  it('returns Low for UV 0-2', () => {
    expect(getUVLabel(0).label).toBe('Low');
    expect(getUVLabel(2).label).toBe('Low');
    expect(getUVLabel(0).color).toBe('#4ade80');
  });

  it('returns Moderate for UV 3-5', () => {
    expect(getUVLabel(3).label).toBe('Moderate');
    expect(getUVLabel(5).label).toBe('Moderate');
  });

  it('returns High for UV 6-7', () => {
    expect(getUVLabel(6).label).toBe('High');
    expect(getUVLabel(7).label).toBe('High');
  });

  it('returns Very High for UV 8-10', () => {
    expect(getUVLabel(8).label).toBe('Very High');
    expect(getUVLabel(10).label).toBe('Very High');
  });

  it('returns Extreme for UV > 10', () => {
    expect(getUVLabel(11).label).toBe('Extreme');
    expect(getUVLabel(15).label).toBe('Extreme');
  });

  it('returns N/A for null/undefined', () => {
    expect(getUVLabel(null).label).toBe('N/A');
    expect(getUVLabel(undefined).label).toBe('N/A');
  });
});

describe('getAQILabel', () => {
  it('returns Good for AQI 0-50', () => {
    expect(getAQILabel(0).label).toBe('Good');
    expect(getAQILabel(50).label).toBe('Good');
    expect(getAQILabel(25).color).toBe('#4ade80');
  });

  it('returns Moderate for AQI 51-100', () => {
    expect(getAQILabel(51).label).toBe('Moderate');
    expect(getAQILabel(100).label).toBe('Moderate');
  });

  it('returns Unhealthy for Sensitive for 101-150', () => {
    expect(getAQILabel(101).label).toBe('Unhealthy for Sensitive');
    expect(getAQILabel(150).label).toBe('Unhealthy for Sensitive');
  });

  it('returns Unhealthy for AQI 151-200', () => {
    expect(getAQILabel(151).label).toBe('Unhealthy');
    expect(getAQILabel(200).label).toBe('Unhealthy');
  });

  it('returns Very Unhealthy for AQI 201-300', () => {
    expect(getAQILabel(201).label).toBe('Very Unhealthy');
  });

  it('returns Hazardous for AQI > 300', () => {
    expect(getAQILabel(301).label).toBe('Hazardous');
    expect(getAQILabel(500).label).toBe('Hazardous');
  });

  it('returns N/A for null/undefined', () => {
    expect(getAQILabel(null).label).toBe('N/A');
    expect(getAQILabel(undefined).label).toBe('N/A');
  });
});
