import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { calcTotalEstimated } from '../utils/budgetUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * TripContext — Global state for trips.
 * All data persists in localStorage — survives refresh.
 */
const TripContext = createContext(null);

export function TripProvider({ children }) {
  // Persisted: all saved trips
  const [savedTrips, setSavedTrips] = useLocalStorage('wanderly_trips', []);

  // Current active trip (ephemeral until saved)
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [spent, setSpent] = useLocalStorage('wanderly_spent', {});
  const [isRainMode, setIsRainMode] = useState(false);

  // Memoized budget
  const totalEstimated = useMemo(() => calcTotalEstimated(itinerary), [itinerary]);
  const totalSpent = useMemo(() => Object.values(spent).reduce((a, b) => a + b, 0), [spent]);
  const percentUsed = useMemo(
    () => (totalEstimated > 0 ? Math.min((totalSpent / totalEstimated) * 100, 100) : 0),
    [totalSpent, totalEstimated]
  );
  const isOverBudget = totalSpent > totalEstimated && totalEstimated > 0;

  const markSpent = useCallback((id, amount) => {
    setSpent((prev) => ({ ...prev, [id]: amount }));
  }, [setSpent]);

  // Save current trip to the saved list
  const saveTrip = useCallback((tripData, scheduledDate = null) => {
    const trip = tripData || itinerary;
    if (!trip) return;
    const entry = {
      id: Date.now().toString(),
      ...trip,
      scheduledDate: scheduledDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setSavedTrips((prev) => [entry, ...prev]);
    return entry.id;
  }, [itinerary, setSavedTrips]);

  // Delete a saved trip
  const deleteTrip = useCallback((id) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== id));
  }, [setSavedTrips]);

  // Edit a saved trip
  const editTrip = useCallback((id, updates) => {
    setSavedTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, [setSavedTrips]);

  // Load a saved trip into the planner
  const loadTrip = useCallback((id) => {
    const trip = savedTrips.find((t) => t.id === id);
    if (trip) {
      setItinerary(trip);
      setActiveDay(0);
    }
  }, [savedTrips]);

  const resetTrip = useCallback(() => {
    setItinerary(null);
    setActiveDay(0);
    setSpent({});
    setIsRainMode(false);
  }, [setSpent]);

  const value = {
    itinerary, setItinerary,
    activeDay, setActiveDay,
    totalEstimated, totalSpent, percentUsed, isOverBudget, markSpent,
    resetTrip, isRainMode, setIsRainMode,
    // Multi-trip
    savedTrips, saveTrip, deleteTrip, editTrip, loadTrip,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside <TripProvider>');
  return ctx;
}
