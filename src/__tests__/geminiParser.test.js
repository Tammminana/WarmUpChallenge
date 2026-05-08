/**
 * geminiParser.test.js
 * Unit tests for Gemini response parsing logic
 */
import { describe, it, expect } from 'vitest';
import { parseGeminiResponse } from '../utils/budgetUtils';

const VALID_RESPONSE = JSON.stringify({
  destination: 'Varanasi, India',
  tripTitle: 'Sacred Varanasi on a Budget',
  duration: '3 days',
  totalBudget: '₹8,000',
  persona: 'Budget Explorer',
  highlights: ['Ganga Aarti', 'Kashi Vishwanath', 'Street food trail'],
  days: [
    {
      day: 1,
      theme: 'Arrival & Ghats',
      activities: [{ time: '07:00 AM', name: 'Ganga Aarti', type: 'culture', cost: 'Free' }],
      dailyBudget: '₹1,500',
      mealSuggestions: { breakfast: 'Kachori', lunch: 'Thali', dinner: 'Dal Baati' },
    },
  ],
  budgetBreakdown: { accommodation: '₹3,000', food: '₹2,000', transport: '₹1,000', activities: '₹500', misc: '₹500' },
  packingTips: ['Light clothes', 'Comfortable sandals'],
  bestTimeToVisit: 'October to March',
  emergencyContacts: { police: '100', ambulance: '108', 'tourist helpline': '1800-111-363' },
});

describe('parseGeminiResponse', () => {
  it('parses a valid JSON response correctly', () => {
    const result = parseGeminiResponse(VALID_RESPONSE);
    expect(result.destination).toBe('Varanasi, India');
    expect(result.days).toHaveLength(1);
    expect(result.days[0].activities[0].name).toBe('Ganga Aarti');
  });

  it('strips markdown code fences before parsing', () => {
    const withFences = '```json\n' + VALID_RESPONSE + '\n```';
    const result = parseGeminiResponse(withFences);
    expect(result.destination).toBe('Varanasi, India');
  });

  it('throws on empty input', () => {
    expect(() => parseGeminiResponse('')).toThrow('Empty response from AI');
    expect(() => parseGeminiResponse(null)).toThrow('Empty response from AI');
  });

  it('throws on malformed JSON', () => {
    expect(() => parseGeminiResponse('{ not valid json }')).toThrow('AI response parsing failed');
  });

  it('throws if destination field is missing', () => {
    const missing = JSON.stringify({ days: [] });
    expect(() => parseGeminiResponse(missing)).toThrow('missing required fields');
  });

  it('throws if days array is missing', () => {
    const missing = JSON.stringify({ destination: 'Paris' });
    expect(() => parseGeminiResponse(missing)).toThrow('missing required fields');
  });
});
