import { useState, useCallback } from 'react';

export function useBudget(itinerary) {
  const [spent, setSpent] = useState({});

  const parseAmount = (costStr) => {
    if (!costStr || costStr.toLowerCase() === 'free') return 0;
    const match = costStr.match(/[\d,]+(\.\d+)?/);
    return match ? parseFloat(match[0].replace(',', '')) : 0;
  };

  const totalEstimated = itinerary?.days?.reduce((acc, day) => {
    return acc + day.activities.reduce((a, act) => a + parseAmount(act.cost), 0);
  }, 0) ?? 0;

  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);

  const markSpent = useCallback((activityId, amount) => {
    setSpent(prev => ({ ...prev, [activityId]: amount }));
  }, []);

  const reset = useCallback(() => setSpent({}), []);

  const percentUsed = totalEstimated > 0 ? Math.min((totalSpent / totalEstimated) * 100, 100) : 0;
  const isOverBudget = totalSpent > totalEstimated;

  return { totalEstimated, totalSpent, percentUsed, isOverBudget, markSpent, reset, parseAmount };
}
