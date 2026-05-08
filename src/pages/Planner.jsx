import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send, Loader2, Sparkles, MapPin, Calendar, Wallet,
  Accessibility, Info, CheckCircle2, Plus, Clock, Cloud,
  ExternalLink, ChevronDown, Search, Save
} from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import { useTrip } from '../context/TripContext';
import styles from './Planner.module.css';

// Typewriter placeholder texts
const SEARCH_HINTS = [
  'Search a city... e.g. Varanasi, Goa, Jaipur',
  'Search places... e.g. temples, beaches, forts',
  'Search hotels... e.g. budget stays in Udaipur',
  'Search experiences... e.g. street food in Delhi',
  'Search trips... e.g. 3 days in Coorg for ₹5,000',
  'Search adventures... e.g. trekking in Manali',
];

function AnimatedSearchInput({ value, onChange, disabled }) {
  const [displayText, setDisplayText] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (value) return; // stop animation when user is typing

    const currentHint = SEARCH_HINTS[hintIndex];
    let timer;

    if (isTyping) {
      if (charIndex < currentHint.length) {
        timer = setTimeout(() => {
          setDisplayText(currentHint.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 45); // typing speed
      } else {
        timer = setTimeout(() => setIsTyping(false), 1800); // pause before erasing
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentHint.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, 25); // erase speed (faster)
      } else {
        setHintIndex((i) => (i + 1) % SEARCH_HINTS.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isTyping, hintIndex, value]);

  return (
    <div className={styles.searchInputWrapper}>
      <Search
        className={`${styles.searchIcon} ${isTyping && !value ? styles.searchPulse : ''}`}
        size={20}
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={value ? '' : displayText + '|'}
        className={styles.input}
        disabled={disabled}
        aria-label="Describe your travel plan"
        aria-describedby="search-hint"
      />
    </div>
  );
}

// Inline OpenStreetMap embed using Nominatim for coordinates
function MapEmbed({ destination }) {
  const [mapUrl, setMapUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destination) return;
    const city = destination.split(',')[0].trim();
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'en' }
    })
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) {
          const { lat, lon } = data[0];
          const zoom = 12;
          const bbox = `${parseFloat(lon) - 0.15},${parseFloat(lat) - 0.1},${parseFloat(lon) + 0.15},${parseFloat(lat) + 0.1}`;
          setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [destination]);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <MapPin size={14} aria-hidden="true" />
        <span>{destination}</span>
        <a
          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapLink}
          aria-label={`Open ${destination} on OpenStreetMap`}
        >
          <ExternalLink size={12} /> Open Map
        </a>
      </div>
      {loading ? (
        <div className={styles.mapLoading}>
          <div className="spinner" aria-hidden="true" />
          <span>Loading map…</span>
        </div>
      ) : mapUrl ? (
        <iframe
          src={mapUrl}
          title={`Map of ${destination}`}
          className={styles.mapIframe}
          loading="lazy"
          aria-label={`Interactive map showing ${destination}`}
        />
      ) : (
        <p className={styles.mapFallback}>Map unavailable for this location.</p>
      )}
    </div>
  );
}

// Generates a Google Calendar link for a day's activities
function makeCalendarUrl(destination, day, activities, tripStartDate = null) {
  const title = encodeURIComponent(`Day ${day.day}: ${day.theme} — ${destination}`);
  const details = encodeURIComponent(
    activities.map(a => `${a.time} ${a.name}: ${a.description}`).join('\n')
  );

  // Build proper date params if we have a trip start date
  let dateParams = '';
  if (tripStartDate) {
    const startDate = new Date(tripStartDate);
    startDate.setDate(startDate.getDate() + (day.day - 1));
    // Format: YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dayStart = new Date(startDate);
    dayStart.setHours(8, 0, 0);
    const dayEnd = new Date(startDate);
    dayEnd.setHours(22, 0, 0);
    dateParams = `&dates=${formatDate(dayStart)}/${formatDate(dayEnd)}`;
  }

  const location = encodeURIComponent(destination);
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${dateParams}`;
}

export default function Planner() {
  const [searchParams] = useSearchParams();
  const { generateItinerary, adjustForRain, loading, error } = useGemini();
  const {
    itinerary, setItinerary,
    activeDay, setActiveDay,
    totalEstimated, totalSpent, percentUsed, isOverBudget, markSpent,
    isRainMode, setIsRainMode, saveTrip
  } = useTrip();

  const [prompt, setPrompt] = useState('');
  const [rainLoading, setRainLoading] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [tripDate, setTripDate] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    const dest = searchParams.get('dest');
    const persona = searchParams.get('persona');
    if (dest || persona) {
      setPrompt(`Plan a trip to ${dest || 'a surprise destination'} as a ${persona || 'traveler'}.`);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    try {
      const data = await generateItinerary(prompt);
      setItinerary(data);
      setActiveDay(0);
      setIsRainMode(false);
      setShowSave(false);
      setSaveSuccess(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    } finally {
      setRainLoading(false);
    }
  };

  const handleSaveTrip = (e) => {
    e.preventDefault();
    if (!tripDate) {
      alert("Please select a date first.");
      return;
    }
    saveTrip(itinerary, new Date(tripDate).toISOString());
    setSaveSuccess(true);
    setShowSave(false);
  };

  const currentDay = itinerary?.days?.[activeDay];

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>

        {/* ── WHY WE'RE BUILDING THIS ── */}
        <aside className={styles.missionBanner} aria-label="Mission context">
          <Sparkles size={14} aria-hidden="true" />
          <span>
            <strong>Why Wanderly?</strong> Travel planning is broken — 8+ hours of research, mismatched
            budgets, and zero personalization. We&apos;re fixing that with AI that thinks the way you travel.
          </span>
        </aside>

        {/* ── INPUT SECTION ── */}
        <section
          className={`${styles.inputSection} ${itinerary ? styles.minimized : ''}`}
          aria-labelledby="planner-heading"
        >
          {!itinerary && (
            <div className={styles.intro}>
              <h1 id="planner-heading" className="section-title">Where to next?</h1>
              <p className="section-subtitle">
                Tell Gemini your trip: destination, days, budget, vibe. It builds your complete itinerary instantly.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} role="search">
            <div className={styles.inputWrapper}>
              <AnimatedSearchInput
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                id="generate-btn"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={loading || !prompt.trim()}
                aria-label={loading ? 'Generating itinerary…' : itinerary ? 'Re-generate itinerary' : 'Generate itinerary'}
              >
                {loading
                  ? <Loader2 size={20} className={styles.spinnerIcon} aria-hidden="true" />
                  : <Send size={20} aria-hidden="true" />}
                <span>{loading ? 'Generating…' : itinerary ? 'Re-plan' : 'Generate'}</span>
              </button>
            </div>
            <p id="search-hint" className={styles.searchHint}>
              💡 Try: &quot;4 days in Goa for ₹12,000, beach vibes, budget hotel&quot;
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

        {/* ── RESULTS ── */}
        {itinerary && !loading && (
          <div
            className={`${styles.results} animate-fade-in-up`}
            ref={resultsRef}
            aria-live="polite"
            aria-label="Generated itinerary"
          >
            {/* Header */}
            <header className={styles.itineraryHeader}>
              <div className={styles.headerMain}>
                <div className="badge badge-accent">{itinerary.persona}</div>
                <h2 className={styles.tripTitle}>{itinerary.tripTitle}</h2>
                <div className={styles.meta}>
                  <span><MapPin size={14} aria-hidden="true" /> {itinerary.destination}</span>
                  <span><Calendar size={14} aria-hidden="true" /> {itinerary.duration}</span>
                  <span><Wallet size={14} aria-hidden="true" /> {itinerary.totalBudget}</span>
                </div>
                {itinerary.highlights && (
                  <div className={styles.highlights}>
                    {itinerary.highlights.map((h, i) => (
                      <span key={i} className="badge badge-teal">{h}</span>
                    ))}
                  </div>
                )}
                
                {/* Save Trip Actions */}
                <div className={styles.saveSection}>
                  {!showSave && !saveSuccess ? (
                    <button onClick={() => setShowSave(true)} className="btn btn-outline btn-sm">
                      <Save size={14} /> Save to Itineraries
                    </button>
                  ) : saveSuccess ? (
                    <span className={styles.successText}><CheckCircle2 size={16} /> Saved! Find it in My Itineraries.</span>
                  ) : (
                    <form onSubmit={handleSaveTrip} className={styles.saveForm}>
                      <input 
                        type="datetime-local" 
                        value={tripDate} 
                        onChange={e => setTripDate(e.target.value)} 
                        className={styles.saveInput}
                        required
                        aria-label="Trip start date"
                      />
                      <button type="submit" className="btn btn-primary btn-sm">Confirm Save</button>
                      <button type="button" onClick={() => setShowSave(false)} className="btn btn-outline btn-sm">Cancel</button>
                    </form>
                  )}
                </div>
              </div>

              {/* Budget Tracker */}
              <div className={`glass ${styles.budgetWidget}`} aria-label="Budget tracker">
                <div className={styles.budgetTop}>
                  <span className={styles.budgetLabel}>💰 Budget Tracker</span>
                  <span className={`${styles.budgetStatus} ${isOverBudget ? styles.over : ''}`}>
                    {Math.round(percentUsed)}%
                  </span>
                </div>
                <div className={styles.progressBar} role="progressbar" aria-valuenow={Math.round(percentUsed)} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={`${styles.progressFill} ${isOverBudget ? styles.fillOver : ''}`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <div className={styles.budgetMeta}>
                  <span>Marked spent: ₹{totalSpent}</span>
                  <span>Est. total: ₹{Math.round(totalEstimated)}</span>
                </div>
                {isOverBudget && (
                  <p className={styles.budgetAlert} role="alert">⚠️ You've exceeded the estimated budget!</p>
                )}
              </div>
            </header>

            <div className={styles.mainLayout}>
              {/* Sidebar */}
              <aside className={styles.sidebar} aria-label="Day navigation">
                <h3 className={styles.sidebarTitle}>Days</h3>
                <nav className={styles.dayNav}>
                  {itinerary.days.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDay(idx)}
                      className={`${styles.dayBtn} ${activeDay === idx ? styles.activeDay : ''}`}
                      aria-current={activeDay === idx ? 'true' : undefined}
                      aria-label={`Day ${day.day}: ${day.theme}`}
                    >
                      <span className={styles.dayNum}>Day {day.day}</span>
                      <span className={styles.dayTheme}>{day.theme}</span>
                    </button>
                  ))}
                </nav>

                {/* Map */}
                <MapEmbed destination={itinerary.destination} />

                {/* Packing */}
                {itinerary.packingTips?.length > 0 && (
                  <div className={styles.sidebarSection}>
                    <h4><CheckCircle2 size={14} aria-hidden="true" /> Packing List</h4>
                    <ul>
                      {itinerary.packingTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emergency */}
                {itinerary.emergencyContacts && (
                  <div className={styles.sidebarSection}>
                    <h4>🆘 Emergency Contacts</h4>
                    <ul>
                      {Object.entries(itinerary.emergencyContacts).map(([k, v]) => (
                        <li key={k}><strong>{k}:</strong> {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>

              {/* Day Content */}
              <div className={styles.content}>
                {currentDay && (
                  <>
                    <div className={styles.dayHeader}>
                      <div className={styles.dayHeaderTop}>
                        <h3>Day {currentDay.day}: {currentDay.theme}</h3>
                        <div className={styles.dayActions}>
                          {/* Rain Mode Button */}
                          <button
                            onClick={handleRainMode}
                            className={`btn btn-outline btn-sm ${isRainMode ? styles.rainActive : ''}`}
                            disabled={rainLoading}
                            title="Adjust today's activities for rainy weather"
                            aria-label="Switch to indoor activities for rain"
                          >
                            {rainLoading
                              ? <Loader2 size={14} className={styles.spinnerIcon} />
                              : <Cloud size={14} />}
                            {isRainMode ? '☔ Rain Mode On' : '☔ Rain Mode'}
                          </button>

                          {/* Google Calendar */}
                          <a
                            href={makeCalendarUrl(itinerary.destination, currentDay, currentDay.activities, tripDate || itinerary.scheduledDate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            aria-label={`Add Day ${currentDay.day} to Google Calendar`}
                          >
                            <Calendar size={14} aria-hidden="true" /> Add to Calendar
                          </a>
                        </div>
                      </div>

                      {/* Meals */}
                      <div className={styles.mealGrid}>
                        {Object.entries(currentDay.mealSuggestions || {}).map(([meal, text]) => (
                          <div key={meal} className={styles.mealItem}>
                            <span className={styles.mealLabel}>{meal}</span>
                            <span className={styles.mealText}>{text}</span>
                          </div>
                        ))}
                      </div>

                      <p className={styles.dailyBudget}>
                        <Wallet size={14} aria-hidden="true" /> Estimated daily spend: <strong>{currentDay.dailyBudget}</strong>
                      </p>
                    </div>

                    {/* Activities */}
                    <div className={styles.activitiesList} aria-label="Today's activities">
                      {currentDay.activities.map((act, i) => (
                        <article key={i} className={`card ${styles.activityCard}`}>
                          <div className={styles.actTime} aria-label={`Time: ${act.time}`}>{act.time}</div>
                          <div className={styles.actMain}>
                            <div className={styles.actHeader}>
                              <h4 className={styles.actName}>{act.name}</h4>
                              <span className="badge badge-primary">{act.type}</span>
                            </div>
                            <p className={styles.actDesc}>{act.description}</p>
                            <div className={styles.actFooter}>
                              <span className={styles.actCost}>
                                <Wallet size={12} aria-hidden="true" /> {act.cost}
                              </span>
                              <span className={styles.actDuration}>
                                <Clock size={12} aria-hidden="true" /> {act.duration}
                              </span>
                              {act.accessibility && (
                                <span className={styles.actAccess}>
                                  <Accessibility size={12} aria-hidden="true" /> {act.accessibility}
                                </span>
                              )}
                            </div>
                            {act.tip && (
                              <div className={styles.actTip}>
                                <Info size={14} aria-hidden="true" /> <strong>Tip:</strong> {act.tip}
                              </div>
                            )}
                          </div>
                          <button
                            className={styles.markBtn}
                            onClick={() => markSpent(`${activeDay}-${i}`, act._parsedCost ?? 0)}
                            title="Mark this activity's cost as spent"
                            aria-label={`Mark ${act.name} cost as spent`}
                          >
                            <Plus size={16} aria-hidden="true" />
                          </button>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Budget Breakdown */}
            {itinerary.budgetBreakdown && (
              <section className={styles.breakdown} aria-labelledby="breakdown-heading">
                <h3 id="breakdown-heading" className={styles.breakdownTitle}>💰 Full Budget Breakdown</h3>
                <div className={styles.breakdownGrid}>
                  {Object.entries(itinerary.budgetBreakdown).map(([k, v]) => (
                    <div key={k} className={styles.breakdownItem}>
                      <span className={styles.breakdownKey}>{k}</span>
                      <span className={styles.breakdownVal}>{v}</span>
                    </div>
                  ))}
                </div>
                <p className={styles.breakdownNote}>
                  Best time to visit: <strong>{itinerary.bestTimeToVisit}</strong>
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
