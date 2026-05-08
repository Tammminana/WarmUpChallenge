/**
 * share.test.js — Tests for share/export utilities
 * Tests the encoding/decoding logic directly (no DOM required)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { decodeShareLink } from '../utils/share';

// Manually test the btoa/atob encoding logic that generateShareLink uses
function encodeTrip(trip) {
  const data = JSON.stringify({
    t: trip.tripTitle,
    d: trip.destination,
    dur: trip.duration,
    b: trip.totalBudget,
    p: trip.persona,
    days: trip.days?.map(d => ({
      day: d.day,
      theme: d.theme,
      acts: d.activities?.map(a => ({ n: a.name, t: a.time, c: a.cost, desc: a.description }))
    }))
  });
  return btoa(unescape(encodeURIComponent(data)));
}

const MOCK_TRIP = {
  tripTitle: 'Golden Triangle Adventure',
  destination: 'Delhi, India',
  duration: '5 days',
  totalBudget: '₹25,000',
  persona: 'Budget Explorer',
  days: [
    {
      day: 1,
      theme: 'Old Delhi Heritage',
      activities: [
        { name: 'Red Fort', time: '09:00 AM', cost: '₹35', description: 'Historic Mughal fort' },
        { name: 'Chandni Chowk', time: '12:00 PM', cost: 'Free', description: 'Famous bazaar' },
      ]
    }
  ]
};

describe('encodeTrip / decodeShareLink round-trip', () => {
  it('encodes and decodes a trip correctly', () => {
    const encoded = encodeTrip(MOCK_TRIP);
    expect(encoded).toBeTruthy();
    expect(encoded.length).toBeGreaterThan(10);
    
    const decoded = decodeShareLink(encoded);
    expect(decoded).toBeTruthy();
    expect(decoded.tripTitle).toBe('Golden Triangle Adventure');
    expect(decoded.destination).toBe('Delhi, India');
    expect(decoded.duration).toBe('5 days');
    expect(decoded.persona).toBe('Budget Explorer');
  });

  it('preserves activities data through round-trip', () => {
    const encoded = encodeTrip(MOCK_TRIP);
    const decoded = decodeShareLink(encoded);
    
    expect(decoded.days).toHaveLength(1);
    expect(decoded.days[0].day).toBe(1);
    expect(decoded.days[0].theme).toBe('Old Delhi Heritage');
    expect(decoded.days[0].activities).toHaveLength(2);
    expect(decoded.days[0].activities[0].name).toBe('Red Fort');
    expect(decoded.days[0].activities[1].name).toBe('Chandni Chowk');
  });

  it('handles unicode characters in budget', () => {
    const encoded = encodeTrip(MOCK_TRIP);
    const decoded = decodeShareLink(encoded);
    expect(decoded.totalBudget).toBe('₹25,000');
  });
});

describe('decodeShareLink error handling', () => {
  it('returns null for garbage input', () => {
    expect(decodeShareLink('not-valid-base64!!!')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(decodeShareLink('')).toBeNull();
  });

  it('returns null for valid base64 but invalid JSON', () => {
    const encoded = btoa('this is not json');
    expect(decodeShareLink(encoded)).toBeNull();
  });
});
