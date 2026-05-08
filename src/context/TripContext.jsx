import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { calcTotalEstimated } from '../utils/budgetUtils';

/**
 * TripContext — Global state for the active trip plan.
 * Eliminates prop-drilling between Planner, BudgetTracker, and Sidebar.
 */
const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [spent, setSpent] = useState({});
  const [isRainMode, setIsRainMode] = useState(false);

  // Memoized — only recalculates when itinerary changes
  const totalEstimated = useMemo(() => calcTotalEstimated(itinerary), [itinerary]);

  const totalSpent = useMemo(
    () => Object.values(spent).reduce((a, b) => a + b, 0),
    [spent]
  );

  const percentUsed = useMemo(
    () => (totalEstimated > 0 ? Math.min((totalSpent / totalEstimated) * 100, 100) : 0),
    [totalSpent, totalEstimated]
  );

  const isOverBudget = totalSpent > totalEstimated && totalEstimated > 0;

  const markSpent = useCallback((id, amount) => {
    setSpent((prev) => ({ ...prev, [id]: amount }));
  }, []);

  const resetTrip = useCallback(() => {
    setItinerary(null);
    setActiveDay(0);
    setSpent({});
    setIsRainMode(false);
  }, []);

  const value = {
    itinerary,
    setItinerary,
    activeDay,
    setActiveDay,
    totalEstimated,
    totalSpent,
    percentUsed,
    isOverBudget,
    markSpent,
    resetTrip,
    isRainMode,
    setIsRainMode,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

// Custom hook for consuming context
export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside <TripProvider>');
  return ctx;
}
