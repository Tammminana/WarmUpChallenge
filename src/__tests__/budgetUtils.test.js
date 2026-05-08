/**
 * budgetUtils.test.js
 * Unit tests for budget calculation utilities
 */
import { describe, it, expect } from 'vitest';
import { parseCost, calcTotalEstimated, getBudgetStatus } from '../utils/budgetUtils';

describe('parseCost', () => {
  it('returns 0 for "Free"', () => {
    expect(parseCost('Free')).toBe(0);
    expect(parseCost('free')).toBe(0);
    expect(parseCost('No Cost')).toBe(0);
    expect(parseCost('0')).toBe(0);
    expect(parseCost('')).toBe(0);
  });

  it('parses Indian Rupee strings', () => {
    expect(parseCost('₹500')).toBe(500);
    expect(parseCost('approx ₹1,200')).toBe(1200);
    expect(parseCost('~₹350')).toBe(350);
  });

  it('parses range strings by averaging', () => {
    expect(parseCost('₹200-400')).toBe(300);
    expect(parseCost('200 to 400')).toBe(300);
    expect(parseCost('$10-20')).toBe(15);
    expect(parseCost('₹1000-2000')).toBe(1500);
  });

  it('parses k-suffix shorthand', () => {
    expect(parseCost('5k')).toBe(5000);
    expect(parseCost('2.5k')).toBe(2500);
  });

  it('parses numeric-only strings', () => {
    expect(parseCost('200')).toBe(200);
    expect(parseCost('1000')).toBe(1000);
  });

  it('accepts a raw number', () => {
    expect(parseCost(500)).toBe(500);
    expect(parseCost(0)).toBe(0);
  });

  it('handles null and undefined gracefully', () => {
    expect(parseCost(null)).toBe(0);
    expect(parseCost(undefined)).toBe(0);
  });

  it('returns 0 for NaN number input', () => {
    expect(parseCost(NaN)).toBe(0);
  });

  it('handles unparseable strings', () => {
    expect(parseCost('negotiable')).toBe(0);
    expect(parseCost('varies')).toBe(0);
  });
});

describe('calcTotalEstimated', () => {
  const mockItinerary = {
    days: [
      { activities: [{ cost: '₹500' }, { cost: 'Free' }, { cost: '₹200' }] },
      { activities: [{ cost: '₹300' }, { cost: '₹100' }] },
    ],
  };

  it('sums all activity costs across all days', () => {
    expect(calcTotalEstimated(mockItinerary)).toBe(1100);
  });

  it('handles range costs correctly in total', () => {
    const rangeItinerary = {
      days: [{ activities: [{ cost: '₹200-400' }, { cost: '₹100' }] }]
    };
    expect(calcTotalEstimated(rangeItinerary)).toBe(400); // 300 (avg) + 100
  });

  it('falls back to totalBudget when activities sum to 0', () => {
    const noActivityCosts = {
      totalBudget: '₹15,000',
      days: [{ activities: [{ cost: 'Free' }, { cost: 'Varies' }] }]
    };
    expect(calcTotalEstimated(noActivityCosts)).toBe(15000);
  });

  it('returns 0 for null itinerary', () => {
    expect(calcTotalEstimated(null)).toBe(0);
    expect(calcTotalEstimated({})).toBe(0);
  });

  it('handles empty days array', () => {
    expect(calcTotalEstimated({ days: [] })).toBe(0);
  });
});

describe('getBudgetStatus', () => {
  it('returns On Track when under 50%', () => {
    expect(getBudgetStatus(400, 1000).label).toBe('On Track');
    expect(getBudgetStatus(400, 1000).color).toBe('teal');
  });

  it('returns Moderate between 50-80%', () => {
    expect(getBudgetStatus(700, 1000).label).toBe('Moderate');
  });

  it('returns Near Limit between 80-100%', () => {
    expect(getBudgetStatus(900, 1000).label).toBe('Near Limit');
  });

  it('returns Over Budget when exceeded', () => {
    expect(getBudgetStatus(1200, 1000).label).toBe('Over Budget!');
    expect(getBudgetStatus(1200, 1000).color).toBe('red');
  });

  it('handles 0 estimated budget', () => {
    expect(getBudgetStatus(0, 0).label).toBe('No estimate');
  });
});
