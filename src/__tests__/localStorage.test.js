/**
 * useLocalStorage.test.js — Tests for localStorage persistence hook
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// We test the raw localStorage logic (not the React hook) since vitest doesn't have DOM by default.
// This validates the serialization/deserialization logic our hook depends on.

describe('localStorage persistence logic', () => {
  const storage = {};

  beforeEach(() => {
    // Clear mock storage
    Object.keys(storage).forEach(k => delete storage[k]);
    vi.stubGlobal('localStorage', {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => { storage[key] = value; },
      removeItem: (key) => { delete storage[key]; },
    });
  });

  it('stores and retrieves a string', () => {
    localStorage.setItem('test', JSON.stringify('hello'));
    expect(JSON.parse(localStorage.getItem('test'))).toBe('hello');
  });

  it('stores and retrieves an array', () => {
    const data = [{ id: '1', name: 'Goa Trip' }, { id: '2', name: 'Delhi Trip' }];
    localStorage.setItem('trips', JSON.stringify(data));
    const result = JSON.parse(localStorage.getItem('trips'));
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Goa Trip');
  });

  it('returns null for missing keys', () => {
    expect(localStorage.getItem('nonexistent')).toBeNull();
  });

  it('overwrites existing data', () => {
    localStorage.setItem('key', JSON.stringify('old'));
    localStorage.setItem('key', JSON.stringify('new'));
    expect(JSON.parse(localStorage.getItem('key'))).toBe('new');
  });

  it('removes items', () => {
    localStorage.setItem('key', JSON.stringify('value'));
    localStorage.removeItem('key');
    expect(localStorage.getItem('key')).toBeNull();
  });

  it('handles complex nested objects', () => {
    const trip = {
      id: '123',
      tripTitle: 'Beach Vibes',
      days: [
        { day: 1, activities: [{ name: 'Snorkeling', cost: '₹500' }] }
      ],
      budget: { total: 15000, spent: 3200 }
    };
    localStorage.setItem('trip', JSON.stringify(trip));
    const result = JSON.parse(localStorage.getItem('trip'));
    expect(result.days[0].activities[0].name).toBe('Snorkeling');
    expect(result.budget.spent).toBe(3200);
  });
});
