/**
 * worldClock.test.js
 * Unit tests for timezone and world clock utility functions
 */
import { describe, it, expect } from 'vitest';

// Pure utility for testing timezone conversion
function getTimeInTimezone(timezone) {
  try {
    const now = new Date();
    const opts = { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true };
    return now.toLocaleTimeString('en-US', opts);
  } catch {
    return null;
  }
}

function isValidTimezone(tz) {
  try {
    new Date().toLocaleTimeString('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

describe('getTimeInTimezone', () => {
  it('returns a valid time string for Asia/Kolkata', () => {
    const result = getTimeInTimezone('Asia/Kolkata');
    expect(result).toBeTruthy();
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns a valid time string for America/New_York', () => {
    const result = getTimeInTimezone('America/New_York');
    expect(result).toBeTruthy();
    expect(result).toMatch(/AM|PM/i);
  });

  it('returns null for invalid timezone', () => {
    const result = getTimeInTimezone('Invalid/Timezone');
    expect(result).toBeNull();
  });
});

describe('isValidTimezone', () => {
  it('returns true for valid timezones', () => {
    expect(isValidTimezone('Asia/Kolkata')).toBe(true);
    expect(isValidTimezone('Europe/London')).toBe(true);
    expect(isValidTimezone('Asia/Tokyo')).toBe(true);
    expect(isValidTimezone('Asia/Dubai')).toBe(true);
  });

  it('returns false for invalid timezones', () => {
    expect(isValidTimezone('Mars/Olympus')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
  });
});
