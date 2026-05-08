/**
 * budgetUtils.js — Pure functions for budget calculations
 * Kept pure (no React) so they are easily unit-testable
 */

/**
 * Parses a cost string like "₹500", "Free", "~$20", "approx 300 INR"
 * Returns a number (0 if free or unparseable)
 */
export function parseCost(costStr) {
  if (!costStr || typeof costStr !== 'string') return 0;
  const lower = costStr.toLowerCase().trim();
  if (lower === 'free' || lower === 'no cost' || lower === '0') return 0;
  const match = lower.match(/[\d,]+(\.\d+)?/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/,/g, ''));
}

/**
 * Calculates total estimated cost across all days and activities
 */
export function calcTotalEstimated(itinerary) {
  if (!itinerary?.days?.length) return 0;
  return itinerary.days.reduce((dayAcc, day) => {
    if (!Array.isArray(day.activities)) return dayAcc;
    return dayAcc + day.activities.reduce((actAcc, act) => {
      return actAcc + parseCost(act.cost);
    }, 0);
  }, 0);
}

/**
 * Returns budget status label and color
 */
export function getBudgetStatus(spent, estimated) {
  if (estimated === 0) return { label: 'No estimate', color: 'gray' };
  const pct = (spent / estimated) * 100;
  if (pct < 50) return { label: 'On Track', color: 'teal' };
  if (pct < 80) return { label: 'Moderate', color: 'orange' };
  if (pct <= 100) return { label: 'Near Limit', color: 'rose' };
  return { label: 'Over Budget!', color: 'red' };
}

/**
 * Safely parses Gemini JSON response — won't throw on malformed output
 */
export function parseGeminiResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response from AI');
  }
  // Strip code fences if present
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  try {
    const parsed = JSON.parse(cleaned);
    // Validate essential fields
    if (!parsed.destination || !Array.isArray(parsed.days)) {
      throw new Error('Response missing required fields: destination or days');
    }
    return parsed;
  } catch (e) {
    throw new Error(`AI response parsing failed: ${e.message}`);
  }
}
