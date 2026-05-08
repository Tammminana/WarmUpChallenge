import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Wallet, 
  Accessibility, 
  Info,
  CheckCircle2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import { useBudget } from '../hooks/useBudget';
import styles from './Planner.module.css';

export default function Planner() {
  const [searchParams] = useSearchParams();
  const { generateItinerary, loading, error } = useGemini();
  
  const [prompt, setPrompt] = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  
  const { totalEstimated, totalSpent, percentUsed, isOverBudget, markSpent } = useBudget(itinerary);

  useEffect(() => {
    const dest = searchParams.get('dest');
    const persona = searchParams.get('persona');
    if (dest || persona) {
      const initialPrompt = `Plan a trip to ${dest || 'a surprise destination'} as a ${persona || 'traveler'}.`;
      setPrompt(initialPrompt);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    try {
      const data = await generateItinerary(prompt);
      setItinerary(data);
      setActiveDay(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>
        
        {/* Input Section */}
        <section className={`${styles.inputSection} ${itinerary ? styles.minimized : ''}`}>
          {!itinerary && (
            <div className={styles.intro}>
              <h1 className="section-title">Where to next?</h1>
              <p className="section-subtitle">Describe your trip vibes, budget, and dates. Gemini will do the rest.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputWrapper}>
              <Sparkles className={styles.inputIcon} size={20} />
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 3 days in Varanasi on a 10k budget, spiritual vibes..."
                className={styles.input}
                disabled={loading}
                aria-label="Travel request"
              />
              <button 
                type="submit" 
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={loading || !prompt.trim()}
              >
                {loading ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
                <span>{itinerary ? 'Re-plan' : 'Generate'}</span>
              </button>
            </div>
          </form>

          {error && <div className={styles.error} role="alert">{error}</div>}
        </section>

        {/* Results Section */}
        {itinerary && (
          <div className={`${styles.results} animate-fade-in-up`}>
            
            {/* Header / Summary */}
            <header className={styles.itineraryHeader}>
              <div className={styles.headerMain}>
                <div className={`badge badge-accent`}>{itinerary.persona}</div>
                <h2 className={styles.tripTitle}>{itinerary.tripTitle}</h2>
                <div className={styles.meta}>
                  <span><MapPin size={14} /> {itinerary.destination}</span>
                  <span><Calendar size={14} /> {itinerary.duration}</span>
                  <span><Wallet size={14} /> {itinerary.totalBudget}</span>
                </div>
              </div>

              {/* Budget Tracker Widget */}
              <div className={`glass ${styles.budgetWidget}`}>
                <div className={styles.budgetTop}>
                  <span className={styles.budgetLabel}>Budget Tracker</span>
                  <span className={`${styles.budgetStatus} ${isOverBudget ? styles.over : ''}`}>
                    {Math.round(percentUsed)}%
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${isOverBudget ? styles.fillOver : ''}`} 
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <div className={styles.budgetMeta}>
                  <span>Spent: ₹{totalSpent}</span>
                  <span>Est: ₹{totalEstimated}</span>
                </div>
              </div>
            </header>

            <div className={styles.mainLayout}>
              {/* Sidebar Navigation */}
              <aside className={styles.sidebar}>
                <h3 className={styles.sidebarTitle}>Itinerary</h3>
                <nav className={styles.dayNav}>
                  {itinerary.days.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDay(idx)}
                      className={`${styles.dayBtn} ${activeDay === idx ? styles.activeDay : ''}`}
                    >
                      <span className={styles.dayNum}>Day {day.day}</span>
                      <span className={styles.dayTheme}>{day.theme}</span>
                    </button>
                  ))}
                </nav>

                <div className={styles.sidebarSection}>
                  <h4><CheckCircle2 size={14} /> Packing Highlights</h4>
                  <ul>
                    {itinerary.packingTips.slice(0, 3).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* Day Detail */}
              <div className={styles.content}>
                <div className={styles.dayHeader}>
                  <h3>Day {itinerary.days[activeDay].day}: {itinerary.days[activeDay].theme}</h3>
                  <div className={styles.mealGrid}>
                    {Object.entries(itinerary.days[activeDay].mealSuggestions).map(([meal, text]) => (
                      <div key={meal} className={styles.mealItem}>
                        <span className={styles.mealLabel}>{meal}</span>
                        <span className={styles.mealText}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.activitiesList}>
                  {itinerary.days[activeDay].activities.map((act, i) => (
                    <div key={i} className={`card ${styles.activityCard}`}>
                      <div className={styles.actTime}>{act.time}</div>
                      <div className={styles.actMain}>
                        <div className={styles.actHeader}>
                          <h4 className={styles.actName}>{act.name}</h4>
                          <span className={`badge badge-primary`}>{act.type}</span>
                        </div>
                        <p className={styles.actDesc}>{act.description}</p>
                        <div className={styles.actFooter}>
                          <span className={styles.actCost}>
                            <Wallet size={12} /> {act.cost}
                          </span>
                          <span className={styles.actDuration}>
                            <Clock size={12} /> {act.duration}
                          </span>
                          {act.accessibility && (
                            <span className={styles.actAccess}>
                              <Accessibility size={12} /> {act.accessibility}
                            </span>
                          )}
                        </div>
                        <div className={styles.actTip}>
                          <Info size={14} /> <strong>Tip:</strong> {act.tip}
                        </div>
                      </div>
                      <button 
                        className={styles.markBtn}
                        onClick={() => markSpent(`${activeDay}-${i}`, 500)} // Mock spend for demo
                        title="Add to budget"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !itinerary && (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}>
              <div className="spinner" />
              <span>Gemini is exploring your options...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
