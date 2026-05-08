/**
 * budgetUtils.js — Pure functions for budget calculations
 * Kept pure (no React) so they are easily unit-testable
 */

/**
 * Parses a cost string like "₹500", "Free", "~$20", "approx 300 INR", "₹200-400"
 * Handles ranges by averaging min and max.
 * Returns a number (0 if free or unparseable).
 */
export function parseCost(costStr) {
  if (costStr === null || costStr === undefined) return 0;
  if (typeof costStr === 'number') return isNaN(costStr) ? 0 : costStr;
  const str = String(costStr).toLowerCase().trim();
  if (str === 'free' || str === 'no cost' || str === '0' || str === '') return 0;

  // Remove currency symbols and common prefixes
  const cleaned = str.replace(/[₹$€£¥،,]/g, '').replace(/approx\.?|~|about|around|upto|up to/gi, '').trim();

  // Handle ranges like "200-400" or "200 to 400"
  const rangeMatch = cleaned.match(/(\d+\.?\d*)\s*(?:-|to)\s*(\d+\.?\d*)/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    if (!isNaN(low) && !isNaN(high)) return (low + high) / 2;
  }

  // Single number
  const match = cleaned.match(/(\d[\d.]*k?)/);
  if (!match) return 0;
  let num = match[1];
  if (num.endsWith('k')) return parseFloat(num) * 1000;
  const result = parseFloat(num);
  return isNaN(result) ? 0 : result;
}

/**
 * Calculates total estimated cost across all days and activities.
 * Also attempts to parse from itinerary.totalBudget if activities sum to 0.
 */
export function calcTotalEstimated(itinerary) {
  if (!itinerary?.days?.length) return 0;
  const activitySum = itinerary.days.reduce((dayAcc, day) => {
    if (!Array.isArray(day.activities)) return dayAcc;
    return dayAcc + day.activities.reduce((actAcc, act) => {
      return actAcc + parseCost(act.cost);
    }, 0);
  }, 0);
  // Fallback: parse from the top-level totalBudget string if activities give 0
  if (activitySum === 0 && itinerary.totalBudget) {
    return parseCost(itinerary.totalBudget);
  }
  return activitySum;
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
  let cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    // Validate essential fields
    if (!parsed.destination || !Array.isArray(parsed.days)) {
      throw new Error('Response missing required fields: destination or days');
    }
    return parsed;
  } catch (e) {
    // Attempt aggressive recovery for cut-off JSON (due to max tokens)
    try {
      cleaned = cleaned.replace(/,\s*$/, '');
      const fixes = [
        cleaned + '}',
        cleaned + ']}',
        cleaned + '}]}',
        cleaned + ']}]}',
        cleaned + '"]}]}', // Fix unterminated string
        cleaned + '"}',
        cleaned + '"]}',
      ];
      for (const fix of fixes) {
        try {
          const parsed = JSON.parse(fix);
          if (parsed.destination && Array.isArray(parsed.days)) return parsed;
        } catch {}
      }
    } catch {}
    
    throw new Error(`AI response parsing failed: ${e.message}`);
  }
}
