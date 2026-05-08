import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send, Loader2, Sparkles, MapPin, Calendar, Wallet,
  Plus, ExternalLink, Save, Users, Moon, Sun, Hotel, Search, CheckCircle2
} from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import { useTrip } from '../context/TripContext';
import { parseCost } from '../utils/budgetUtils';
import WeatherWidget from '../components/WeatherWidget';
import MapEmbed from '../components/MapEmbed';
import AnimatedSearchInput from '../components/AnimatedSearchInput';
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
                  {parseInt(members) > 1 && <span><Users size={14} aria-hidden="true" /> {members} travelers</span>}
                  <WeatherWidget
                    destination={itinerary.destination}
                    date={tripDate || itinerary.scheduledDate}
                    compact
                  />
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

              {/* Budget Tracker — shows expenses from Budget page + AI estimate */}
              <div className={`glass ${styles.budgetWidget}`} aria-label="Budget tracker">
                <div className={styles.budgetTop}>
                  <span className={styles.budgetLabel}>💰 Budget Tracker</span>
                  <span className={`${styles.budgetStatus} ${isOverBudget ? styles.over : ''}`}>
                    {totalEstimated > 0 ? `${Math.round(percentUsed)}%` : '—'}
                  </span>
                </div>
                <div className={styles.progressBar} role="progressbar" aria-valuenow={Math.round(percentUsed)} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={`${styles.progressFill} ${isOverBudget ? styles.fillOver : ''}`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <div className={styles.budgetMeta}>
                  <span>Logged spent: {currency.split(' ')[0]}{totalSpent.toLocaleString()}</span>
                  <span>Est. total: {totalEstimated > 0 ? `${currency.split(' ')[0]}${Math.round(totalEstimated).toLocaleString()}` : 'n/a'}</span>
                </div>
                {isOverBudget && (
                  <p className={styles.budgetAlert} role="alert">⚠️ You've exceeded the estimated budget!</p>
                )}
                <Link to="/budget" className={`btn btn-outline btn-sm ${styles.budgetLink}`}>
                  <Wallet size={12} /> Open Full Budget Tracker
                </Link>
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

                      {/* Hotel recommendation */}
                      {currentDay.hotel?.name && currentDay.hotel.name !== 'null' && (
                        <div className={styles.hotelCard} aria-label="Hotel recommendation">
                          <Hotel size={16} aria-hidden="true" />
                          <div>
                            <strong>{currentDay.hotel.name}</strong>
                            <span className={styles.hotelArea}> · {currentDay.hotel.area}</span>
                            {currentDay.hotel.costPerNight && (
                              <span className={styles.hotelCost}> · {currentDay.hotel.costPerNight}/night</span>
                            )}
                            {currentDay.hotel.whyHere && (
                              <p className={styles.hotelWhy}>{currentDay.hotel.whyHere}</p>
                            )}
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(currentDay.hotel.name + ' ' + itinerary.destination)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.hotelMapLink}
                            aria-label={`Find ${currentDay.hotel.name} on Google Maps`}
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
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
                            onClick={() => markSpent(`${activeDay}-${i}`, parseCost(act.cost))}
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
