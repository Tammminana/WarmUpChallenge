/**
 * planner.test.js — Tests for structured prompt building logic
 */
import { describe, it, expect } from 'vitest';

// Test the prompt-building logic (extracted from Planner component)
function buildPrompt({ destination, numDays, budget, currency, members, vibe, isNightPerson, extraPrefs }) {
  const currSymbol = currency.split(' ')[0];
  let prompt = `Plan a ${numDays}-day trip to ${destination}`;
  if (budget) prompt += ` with a budget of ${currSymbol}${budget}`;
  if (parseInt(members) > 1) prompt += ` for ${members} people`;
  if (vibe) prompt += `, traveling as a ${vibe}`;
  if (isNightPerson) prompt += `. I'm a night person — prefer late dinners, nightlife, and late morning starts`;
  if (extraPrefs && extraPrefs.trim()) prompt += `. ${extraPrefs.trim()}`;
  prompt += '.';
  return prompt;
}

describe('buildPrompt', () => {
  it('builds a basic prompt with destination and days', () => {
    const result = buildPrompt({
      destination: 'Goa',
      numDays: '3',
      budget: '',
      currency: '₹ INR',
      members: '1',
      vibe: '',
      isNightPerson: false,
      extraPrefs: '',
    });
    expect(result).toBe('Plan a 3-day trip to Goa.');
  });

  it('includes budget with currency symbol', () => {
    const result = buildPrompt({
      destination: 'Paris',
      numDays: '5',
      budget: '2000',
      currency: '€ EUR',
      members: '1',
      vibe: '',
      isNightPerson: false,
      extraPrefs: '',
    });
    expect(result).toContain('with a budget of €2000');
  });

  it('includes multiple members', () => {
    const result = buildPrompt({
      destination: 'Delhi',
      numDays: '3',
      budget: '15000',
      currency: '₹ INR',
      members: '4',
      vibe: '',
      isNightPerson: false,
      extraPrefs: '',
    });
    expect(result).toContain('for 4 people');
  });

  it('includes vibe/persona', () => {
    const result = buildPrompt({
      destination: 'Tokyo',
      numDays: '7',
      budget: '',
      currency: '¥ JPY',
      members: '2',
      vibe: 'Foodie',
      isNightPerson: false,
      extraPrefs: '',
    });
    expect(result).toContain('traveling as a Foodie');
  });

  it('includes night person preference', () => {
    const result = buildPrompt({
      destination: 'Bangkok',
      numDays: '4',
      budget: '',
      currency: '₹ INR',
      members: '1',
      vibe: '',
      isNightPerson: true,
      extraPrefs: '',
    });
    expect(result).toContain('night person');
    expect(result).toContain('late dinners');
  });

  it('includes extra preferences', () => {
    const result = buildPrompt({
      destination: 'Jaipur',
      numDays: '2',
      budget: '5000',
      currency: '₹ INR',
      members: '2',
      vibe: 'Budget Explorer',
      isNightPerson: false,
      extraPrefs: 'vegetarian food only, avoid crowds',
    });
    expect(result).toContain('vegetarian food only, avoid crowds');
    expect(result).toContain('Budget Explorer');
    expect(result).toContain('₹5000');
  });

  it('builds a complete prompt with all fields', () => {
    const result = buildPrompt({
      destination: 'London',
      numDays: '5',
      budget: '3000',
      currency: '£ GBP',
      members: '3',
      vibe: 'Culture Enthusiast',
      isNightPerson: true,
      extraPrefs: 'interested in museums',
    });
    expect(result).toBe(
      "Plan a 5-day trip to London with a budget of £3000 for 3 people, traveling as a Culture Enthusiast. I'm a night person — prefer late dinners, nightlife, and late morning starts. interested in museums."
    );
  });
});

describe('split calculations', () => {
  // Test the balance calculation logic (extracted from Budget component)
  function calcBalances(people, expenses) {
    const bals = {};
    people.forEach(p => (bals[p] = 0));
    if (people.length <= 1) return bals;

    expenses.forEach(exp => {
      const share = exp.splitAmong || people;
      const splitAmount = exp.amount / share.length;
      share.forEach(p => {
        if (bals[p] !== undefined) {
          if (p === exp.paidBy) {
            bals[p] += (exp.amount - splitAmount);
          } else {
            bals[p] -= splitAmount;
          }
        }
      });
    });
    return bals;
  }

  it('calculates equal split correctly', () => {
    const people = ['Alice', 'Bob'];
    const expenses = [
      { amount: 100, paidBy: 'Alice', splitAmong: ['Alice', 'Bob'] }
    ];
    const bals = calcBalances(people, expenses);
    expect(bals['Alice']).toBe(50);
    expect(bals['Bob']).toBe(-50);
  });

  it('handles custom split among subset of people', () => {
    const people = ['A', 'B', 'C'];
    const expenses = [
      { amount: 90, paidBy: 'A', splitAmong: ['A', 'B', 'C'] }
    ];
    const bals = calcBalances(people, expenses);
    expect(bals['A']).toBe(60); // paid 90, owes 30
    expect(bals['B']).toBe(-30);
    expect(bals['C']).toBe(-30);
  });

  it('handles partial split (only 2 of 3)', () => {
    const people = ['A', 'B', 'C'];
    const expenses = [
      { amount: 100, paidBy: 'A', splitAmong: ['A', 'B'] }
    ];
    const bals = calcBalances(people, expenses);
    expect(bals['A']).toBe(50);
    expect(bals['B']).toBe(-50);
    expect(bals['C']).toBe(0); // not involved
  });

  it('handles multiple expenses from different payers', () => {
    const people = ['Alice', 'Bob'];
    const expenses = [
      { amount: 200, paidBy: 'Alice', splitAmong: ['Alice', 'Bob'] },
      { amount: 100, paidBy: 'Bob', splitAmong: ['Alice', 'Bob'] },
    ];
    const bals = calcBalances(people, expenses);
    // Alice paid 200, owes 150 → gets back 50
    // Bob paid 100, owes 150 → owes 50
    expect(bals['Alice']).toBe(50);
    expect(bals['Bob']).toBe(-50);
  });

  it('returns zeros for single person', () => {
    const bals = calcBalances(['Me'], [{ amount: 100, paidBy: 'Me' }]);
    expect(bals['Me']).toBe(0);
  });
});
