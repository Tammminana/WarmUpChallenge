import { useState, Suspense, lazy } from 'react';
import { MapPin, Calendar, Wallet, Users, Save, CheckCircle2, Cloud, Loader2, Hotel, ExternalLink, Plus, Clock, Accessibility, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import WeatherWidget from './WeatherWidget';
import styles from '../pages/Planner.module.css';

const MapEmbed = lazy(() => import('./MapEmbed'));

export default function ItineraryDisplay({ 
  itinerary, 
  loading, 
  resultsRef, 
  members, 
  tripDate, 
  setTripDate, 
  showSave, 
  setShowSave, 
  saveSuccess, 
  handleSaveTrip, 
  totalEstimated, 
  percentUsed, 
  isOverBudget, 
  totalSpent, 
  currency, 
  activeDay, 
  setActiveDay, 
  currentDay, 
  handleRainMode, 
  isRainMode, 
  rainLoading, 
  makeCalendarUrl, 
  markSpent, 
  parseCost 
}) {
  if (!itinerary || loading) return null;

  return (
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

        {/* Budget Tracker */}
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
          <Suspense fallback={<div className={styles.mapLoading}><div className="spinner" /><span>Loading map module...</span></div>}>
            <MapEmbed destination={itinerary.destination} />
          </Suspense>

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
  );
}
