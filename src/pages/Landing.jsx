import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Zap, Globe, ArrowRight, Star, Wallet, Shield } from 'lucide-react';
import WorldClock from '../components/WorldClock';
import styles from './Landing.module.css';

// Core 3 features — each routes somewhere meaningful
const FEATURES = [
  {
    icon: <Zap size={24} aria-hidden="true" />,
    title: 'AI-Powered Itineraries',
    desc: 'Gemini AI crafts a full day-by-day plan in seconds — logical timing, local tips, and budget-aware stops.',
    color: 'purple',
    link: '/plan',
    why: 'We eliminate 8 hours of research with one AI prompt.',
  },
  {
    icon: <Wallet size={24} aria-hidden="true" />,
    title: 'Smart Budget Tracker',
    desc: 'Real-time cost estimates for every activity. Track spending and get alerts before you overspend.',
    color: 'orange',
    link: '/budget',
    why: "Budget overruns ruin trips. We track every rupee so you don't have to.",
  },
  {
    icon: <Globe size={24} aria-hidden="true" />,
    title: 'Multilingual Ready',
    desc: 'Plan your trip in Hindi, Telugu, Tamil, or any language. Google Translation handles the rest.',
    color: 'teal',
    link: '/plan',
    why: "Travel planning shouldn't require English fluency.",
  },
];

const PERSONAS = [
  { emoji: '🎒', label: 'Budget Explorer', desc: 'Free attractions & street food' },
  { emoji: '🏛️', label: 'History Buff', desc: 'Museums, forts & heritage walks' },
  { emoji: '🍜', label: 'Luxury Foodie', desc: 'Fine dining & culinary tours' },
  { emoji: '🧘', label: 'Wellness Seeker', desc: 'Yoga, spas & nature retreats' },
  { emoji: '📸', label: 'Photo Hunter', desc: 'Golden hour spots & viewpoints' },
  { emoji: '🎉', label: 'Nightlife Lover', desc: 'Bars, clubs & late-night eats' },
];

const SAMPLE_DESTINATIONS = [
  { name: 'Varanasi', country: 'India', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&q=80', tag: 'Spiritual' },
  { name: 'Goa', country: 'India', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80', tag: 'Beach' },
  { name: 'Jaipur', country: 'India', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80', tag: 'Culture' },
];

const EXPLORE_CITIES = [
  { name: 'Mumbai', tz: 'Asia/Kolkata', bbox: '72.75,18.85,73.05,19.25' },
  { name: 'London', tz: 'Europe/London', bbox: '-0.489,51.28,0.236,51.68' },
  { name: 'New York', tz: 'America/New_York', bbox: '-74.25,40.47,-73.70,40.91' },
  { name: 'Tokyo', tz: 'Asia/Tokyo', bbox: '139.56,35.52,139.91,35.81' },
  { name: 'Dubai', tz: 'Asia/Dubai', bbox: '55.10,24.95,55.50,25.35' },
];

// Interactive map component — click a location to start planning
function ExploreMap() {
  const navigate = useNavigate();
  const [activeCity, setActiveCity] = useState(EXPLORE_CITIES[0]);

  const handleMapClick = useCallback(() => {
    navigate(`/plan?dest=${encodeURIComponent(activeCity.name)}`);
  }, [navigate, activeCity]);

  return (
    <div className={styles.mapExplore}>
      <div className={styles.mapLeft}>
        <h3 className={styles.mapTitle}>📍 Explore on the Map</h3>
        <p className={styles.mapDesc}>
          Select a city to see its local time and map. Click to start planning a trip there.
        </p>
        
        <div className={styles.cityButtons}>
          {EXPLORE_CITIES.map(c => (
            <button 
              key={c.name}
              className={`${styles.cityBtn} ${activeCity.name === c.name ? styles.activeCity : ''}`}
              onClick={() => setActiveCity(c)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className={styles.clockContainer}>
          <WorldClock timezone={activeCity.tz} city={activeCity.name} />
        </div>

        <button onClick={handleMapClick} className="btn btn-primary">
          Plan Trip to {activeCity.name} <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.mapRight}>
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeCity.bbox}&layer=mapnik`}
          title={`${activeCity.name} Map - Click to explore`}
          className={styles.mapFrame}
          loading="lazy"
          aria-label={`Interactive map of ${activeCity.name} for trip planning`}
        />
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className="container">
          <div className={styles.heroContent}>
            <div className={`badge badge-primary ${styles.heroBadge} animate-fade-in-up`}>
              <Star size={12} aria-hidden="true" /> Powered by Google Gemini
            </div>
            <h1 id="hero-heading" className={`${styles.heroTitle} animate-fade-in-up`}>
              Your AI Travel<br />
              <span className={styles.heroAccent}>Companion</span>
            </h1>
            <p className={`${styles.heroSubtitle} animate-fade-in-up`}>
              Describe your dream trip in plain language. Wanderly crafts a personalized, budget-smart itinerary in seconds — powered by Google Gemini AI.
            </p>

            <div className={`${styles.heroCta} animate-fade-in-up`}>
              <Link to="/plan" className="btn btn-primary btn-lg" aria-label="Start planning your trip now">
                Plan My Trip <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">
                See How It Works
              </a>
            </div>
          </div>

          {/* Hero visual prompt card */}
          <div className={`${styles.heroVisual} animate-scale-in`} aria-hidden="true">
            <div className={styles.promptCard}>
              <div className={styles.promptHeader}>
                <div className={styles.promptDots}>
                  <span /><span /><span />
                </div>
                <span className={styles.promptLabel}>AI Travel Prompt</span>
              </div>
              <div className={styles.promptBody}>
                <p className={styles.promptText}>
                  "Plan a 3-day spiritual trip to Varanasi for ₹8,000. I prefer walking, hate crowds in the morning, and love local street food."
                </p>
              </div>
              <div className={styles.promptResponse}>
                <div className={styles.typingDot} />
                <span>Wanderly is crafting your itinerary…</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className={styles.destinations} aria-labelledby="destinations-heading">
        <div className="container">
          <h2 id="destinations-heading" className={styles.sectionHeading}>Popular Destinations</h2>
          <div className={`${styles.destGrid} stagger`}>
            {SAMPLE_DESTINATIONS.map((d) => (
              <Link
                to={`/plan?dest=${encodeURIComponent(d.name)}`}
                key={d.name}
                className={styles.destCard}
                aria-label={`Plan a trip to ${d.name}, ${d.country}`}
              >
                <img src={d.img} alt={`${d.name} cityscape`} className={styles.destImg} loading="lazy" />
                <div className={styles.destOverlay}>
                  <span className={`badge badge-primary ${styles.destTag}`}>{d.tag}</span>
                  <div>
                    <div className={styles.destName}>{d.name}</div>
                    <div className={styles.destCountry}>
                      <MapPin size={12} aria-hidden="true" /> {d.country}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP EXPLORE ── */}
      <section className={styles.mapSection} aria-labelledby="map-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 id="map-heading" className="section-title">Explore destinations on the map</h2>
            <p className="section-subtitle">Pick a spot, plan a trip. It starts with a single click.</p>
          </div>
          <ExploreMap />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.features} aria-labelledby="features-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 id="features-heading" className="section-title">Everything you need to travel smarter</h2>
            <p className="section-subtitle">Built with Google AI at its core — not just a list generator, but a real travel brain.</p>
          </div>
          <div className={`${styles.featGrid} stagger`}>
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                to={f.link}
                className={`card ${styles.featCard} ${styles[`color-${f.color}`]}`}
                aria-label={`${f.title} — ${f.why}`}
              >
                <div className={`${styles.featIcon} ${styles[`icon-${f.color}`]}`}>{f.icon}</div>
                <h3 className={styles.featTitle}>{f.title}</h3>
                <p className={styles.featDesc}>{f.desc}</p>
                <p className={styles.featWhy}>💡 {f.why}</p>
              </Link>
            ))}
          </div>
          {/* Accessibility — concise footnote */}
          <p className={styles.a11yNote} aria-label="Accessibility commitment">
            ♿ Built with full keyboard navigation, ARIA screen-reader support, and high-contrast mode.
          </p>
        </div>
      </section>

      {/* ── PERSONAS ── */}
      <section className={styles.personas} aria-labelledby="personas-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 id="personas-heading" className="section-title">What kind of traveler are you?</h2>
          </div>
          <div className={`${styles.personaGrid} stagger`}>
            {PERSONAS.map((p) => (
              <Link
                to={`/plan?persona=${encodeURIComponent(p.label)}`}
                key={p.label}
                className={`card ${styles.personaCard}`}
                aria-label={`Plan as a ${p.label}`}
              >
                <span className={styles.personaEmoji} role="img" aria-hidden="true">{p.emoji}</span>
                <div className={styles.personaLabel}>{p.label}</div>
                <div className={styles.personaDesc}>{p.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner} aria-labelledby="cta-heading">
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 id="cta-heading" className={styles.ctaTitle}>Ready to explore?</h2>
            <p className={styles.ctaSubtitle}>Your next adventure is one prompt away.</p>
            <Link to="/plan" className="btn btn-accent btn-lg">
              Start Planning Free <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer} role="contentinfo">
        <div className="container">
          <p className={styles.footerText}>
            Built for <strong>PromptAI War</strong> · Powered by Google Gemini · Deployed on Cloud Run
          </p>
          <p className={styles.footerA11y}>
            <Shield size={10} aria-hidden="true" /> Accessible · Secure · Open Source
          </p>
        </div>
      </footer>
    </div>
  );
}
