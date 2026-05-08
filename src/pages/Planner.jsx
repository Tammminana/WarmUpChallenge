import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send, Loader2, Sparkles, MapPin, Calendar, Wallet,
  Plus, ExternalLink, Save, Users, Moon, Sun, Hotel, Search, CheckCircle2,
  Accessibility, Clock, Cloud, Info
} from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import { useTrip } from '../context/TripContext';
import { parseCost } from '../utils/budgetUtils';
import WeatherWidget from '../components/WeatherWidget';
import AnimatedSearchInput from '../components/AnimatedSearchInput';
import ItineraryDisplay from '../components/ItineraryDisplay';
import styles from './Planner.module.css';

// AnimatedSearchInput extracted to src/components/AnimatedSearchInput.jsx

// Google Maps embed extracted to src/components/MapEmbed.jsx
// Generates a Google Calendar link with proper dates
function makeCalendarUrl(destination, day, activities, tripStartDate = null) {
  const title = encodeURIComponent(`Day ${day.day}: ${day.theme} — ${destination}`);
  const details = encodeURIComponent(
    activities.map(a => `${a.time} ${a.name}: ${a.description}`).join('\n')
  );
  let dateParams = '';
  if (tripStartDate) {
    const startDate = new Date(tripStartDate);
    startDate.setDate(startDate.getDate() + (day.day - 1));
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dayStart = new Date(startDate); dayStart.setHours(8, 0, 0);
    const dayEnd = new Date(startDate); dayEnd.setHours(22, 0, 0);
    dateParams = `&dates=${formatDate(dayStart)}/${formatDate(dayEnd)}`;
  }
  const location = encodeURIComponent(destination);
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${dateParams}`;
}

const CURRENCIES = ['₹ INR', '$ USD', '€ EUR', '£ GBP', '¥ JPY', 'د.إ AED'];
const VIBES = [
  'Budget Explorer', 'History Buff', 'Luxury Foodie', 'Wellness Seeker', 
  'Photo Hunter', 'Nightlife Lover', 'Luxury Traveler', 'Adventure Seeker', 
  'Culture Enthusiast', 'Foodie', 'Night Owl', 'Family Trip', 'Solo Wanderer'
];

export default function Planner() {
  const [searchParams] = useSearchParams();
  const { generateItinerary, adjustForRain, loading, error } = useGemini();
  const {
    itinerary, setItinerary,
    activeDay, setActiveDay,
    totalEstimated, totalSpent, percentUsed, isOverBudget, markSpent,
    isRainMode, setIsRainMode, saveTrip
  } = useTrip();

  const [destination, setDestination] = useState('');
  const [numDays, setNumDays] = useState('3');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('₹ INR');
  const [members, setMembers] = useState('1');
  const [vibe, setVibe] = useState('');
  const [isNightPerson, setIsNightPerson] = useState(false);
  const [includeHotels, setIncludeHotels] = useState(false);

  // Free text for extra preferences
  const [extraPrefs, setExtraPrefs] = useState('');

  const [rainLoading, setRainLoading] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [tripDate, setTripDate] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const resultsRef = useRef(null);
  const destInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) return;
      
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
      if (!apiKey) return;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!window.google || !destInputRef.current) return;
      autocompleteRef.current = new window.google.maps.places.Autocomplete(destInputRef.current, {
        types: ['(cities)'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          setDestination(place.formatted_address);
        } else if (place.name) {
          setDestination(place.name);
        }
      });
    };

    if (window.google) {
      initAutocomplete();
    } else {
      loadGoogleMaps();
    }
  }, []);

  // Pre-fill from URL params (from Landing page destination clicks)
  useEffect(() => {
    const dest = searchParams.get('dest');
    const persona = searchParams.get('persona');
    if (dest) {
      setDestination(dest);
      // Focus the destination input after mount so user sees it pre-filled
      setTimeout(() => {
        destInputRef.current?.focus();
        destInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
    if (persona) setVibe(persona);
  }, [searchParams]);

  const buildPrompt = useCallback(() => {
    const currSymbol = currency.split(' ')[0];
    let prompt = `Plan a ${numDays}-day trip to ${destination}`;
    if (budget) prompt += ` with a budget of ${currSymbol}${budget}`;
    if (parseInt(members) > 1) prompt += ` for ${members} people`;
    if (vibe) prompt += `, traveling as a ${vibe}`;
    if (includeHotels) prompt += `. For each day, include a hotel stay recommendation (name, area, approx cost per night, why it suits the area)`;
    if (isNightPerson) prompt += `. I'm a night person — prefer late dinners, nightlife, and late morning starts`;
    if (extraPrefs.trim()) prompt += `. ${extraPrefs.trim()}`;
    prompt += '.';
    return prompt;
  }, [destination, numDays, budget, currency, members, vibe, isNightPerson, includeHotels, extraPrefs]);

  const isFormReady = destination.trim().length >= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormReady || loading) return;
    try {
      const prompt = buildPrompt();
      const data = await generateItinerary(prompt);
      setItinerary(data);
      setActiveDay(0);
      setIsRainMode(false);
      setShowSave(false);
      setSaveSuccess(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) { }
  };

  const handleRainMode = async () => {
    if (!itinerary || rainLoading) return;
    setRainLoading(true);
    try {
      const currentActivities = itinerary.days[activeDay].activities;
      const newActivities = await adjustForRain(currentActivities, itinerary.destination);
      const updatedDays = itinerary.days.map((d, i) =>
        i === activeDay ? { ...d, activities: newActivities } : d
      );
      setItinerary({ ...itinerary, days: updatedDays });
      setIsRainMode(true);
    } catch (err) { } finally {
      setRainLoading(false);
    }
  };

  const handleSaveTrip = (e) => {
    e.preventDefault();
    if (!tripDate) { alert("Please select a date first."); return; }
    saveTrip(itinerary, new Date(tripDate).toISOString());
    setSaveSuccess(true);
    setShowSave(false);
  };

  const currentDay = itinerary?.days?.[activeDay];

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>

        {/* ── INPUT SECTION ── */}
        <section
          className={`${styles.inputSection} ${itinerary ? styles.minimized : ''}`}
          aria-labelledby="planner-heading"
        >
          {!itinerary && (
            <div className={styles.intro}>
              <h1 id="planner-heading" className="section-title">Where to next?</h1>
              <p className="section-subtitle">
                Fill in your trip details below. Wanderly AI builds your complete itinerary instantly.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} role="search">
            {/* Structured Inputs */}
            <div className={styles.structuredInputs}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <MapPin size={14} /> Destination *
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Goa, Jaipur, Paris"
                  className={styles.structuredField}
                  required
                  disabled={loading}
                  aria-label="Trip destination"
                  ref={destInputRef}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <Calendar size={14} /> Days
                </label>
                <select value={numDays} onChange={e => setNumDays(e.target.value)} className={styles.structuredField} disabled={loading} aria-label="Number of days">
                  {[1,2,3,4,5,6,7,10,14].map(n => <option key={n} value={n}>{n} {n===1 ? 'day' : 'days'}</option>)}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <Wallet size={14} /> Budget
                </label>
                <div className={styles.budgetRow}>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className={styles.currencySelect} disabled={loading} aria-label="Currency">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="15000"
                    className={styles.structuredField}
                    min="0"
                    disabled={loading}
                    aria-label="Budget amount"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  <Users size={14} /> Members
                </label>
                <select value={members} onChange={e => setMembers(e.target.value)} className={styles.structuredField} disabled={loading} aria-label="Number of travelers">
                  {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} {n===1 ? 'person' : 'people'}</option>)}
                </select>
              </div>

              <div className={`${styles.inputGroup} ${styles.vibeGroup}`}>
                <label className={styles.inputLabel}>
                  <Sparkles size={14} /> Vibe
                </label>
                <select value={vibe} onChange={e => setVibe(e.target.value)} className={styles.structuredField} disabled={loading} aria-label="Travel style">
                  <option value="">Choose a vibe...</option>
                  {VIBES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Schedule + Hotels — beside vibe on 2nd row */}
              <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    {isNightPerson ? <Moon size={14} /> : <Sun size={14} />} Schedule
                  </label>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${isNightPerson ? styles.nightActive : ''}`}
                    onClick={() => setIsNightPerson(!isNightPerson)}
                    disabled={loading}
                    aria-label={isNightPerson ? 'Night owl mode active' : 'Early bird mode'}
                  >
                    {isNightPerson ? '🌙 Night Owl' : '☀️ Early Bird'}
                  </button>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    <Hotel size={14} /> Hotels
                  </label>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${includeHotels ? styles.hotelActive : ''}`}
                    onClick={() => setIncludeHotels(!includeHotels)}
                    disabled={loading}
                    aria-label={includeHotels ? 'Hotel suggestions on' : 'Add hotel suggestions'}
                  >
                    {includeHotels ? '🏨 Hotels On' : '🏨 Add Hotels'}
                  </button>
                </div>
            </div>

            {/* Weather preview for destination + first day */}
            {destination.trim().length >= 2 && (
              <div className={styles.weatherRow}>
                <WeatherWidget
                  destination={destination}
                  date={tripDate || null}
                />
                {tripDate && (
                  <span className={styles.weatherNote}>
                    Weather for {new Date(tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            )}

            {/* Extra preferences — animated search */}
            <div className={styles.inputWrapper}>
              <AnimatedSearchInput
                value={extraPrefs}
                onChange={(e) => setExtraPrefs(e.target.value)}
                disabled={loading || !isFormReady}
                placeholder={!isFormReady ? 'Fill destination above first...' : undefined}
              />
              <button
                type="submit"
                id="generate-btn"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={loading || !isFormReady}
                aria-label={loading ? 'Generating itinerary…' : 'Generate itinerary'}
              >
                {loading
                  ? <Loader2 size={20} className={styles.spinnerIcon} aria-hidden="true" />
                  : <Send size={20} aria-hidden="true" />}
                <span>{loading ? 'Generating…' : itinerary ? 'Re-plan' : 'Generate'}</span>
              </button>
            </div>
            <p id="search-hint" className={styles.searchHint}>
              {isFormReady
                ? `✨ Ready to plan ${numDays} days in ${destination}${vibe ? ` as ${vibe}` : ''}`
                : '👆 Enter a destination to get started'}
            </p>
          </form>

          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              ⚠️ {error}
            </div>
          )}
        </section>

        {/* ── LOADING ── */}
        {loading && (
          <div className={styles.loadingState} aria-live="polite" aria-busy="true">
            <div className={styles.loadingSpinner}>
              <div className="spinner" aria-hidden="true" />
              <div>
                <p className={styles.loadingTitle}>Gemini is crafting your itinerary…</p>
                <p className={styles.loadingSubtitle}>Analysing budget · Picking best stops · Timing activities</p>
              </div>
            </div>
          </div>
        )}

        <ItineraryDisplay 
          itinerary={itinerary}
          loading={loading}
          resultsRef={resultsRef}
          members={members}
          tripDate={tripDate}
          setTripDate={setTripDate}
          showSave={showSave}
          setShowSave={setShowSave}
          saveSuccess={saveSuccess}
          handleSaveTrip={handleSaveTrip}
          totalEstimated={totalEstimated}
          percentUsed={percentUsed}
          isOverBudget={isOverBudget}
          totalSpent={totalSpent}
          currency={currency}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          currentDay={currentDay}
          handleRainMode={handleRainMode}
          isRainMode={isRainMode}
          rainLoading={rainLoading}
          makeCalendarUrl={makeCalendarUrl}
          markSpent={markSpent}
          parseCost={parseCost}
        />
      </div>
    </div>
  );
}
