import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Zap, Globe, ArrowRight, Star, Wallet, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import WorldClock from '../components/WorldClock';
import styles from './Landing.module.css';

// Core 3 features
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

// Kazakhstan hero photos — 4 stunning, distinct locations
const KAZAKHSTAN_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=900&q=85',
    caption: 'Charyn Canyon, East Kazakhstan',
    alt: 'Red rock canyon formations at Charyn Canyon, Kazakhstan',
    dest: 'Charyn Canyon, Kazakhstan',
  },
  {
    url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=900&q=85',
    caption: 'Big Almaty Lake, Almaty Region',
    alt: 'Turquoise Big Almaty Lake surrounded by Tian Shan mountains',
    dest: 'Almaty, Kazakhstan',
  },
  {
    url: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=900&q=85',
    caption: 'Altyn-Emel National Park',
    alt: 'Vast steppe and sand dunes at Altyn-Emel National Park, Kazakhstan',
    dest: 'Altyn-Emel, Kazakhstan',
  },
  {
    url: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=900&q=85',
    caption: 'Tian Shan Mountains, South Kazakhstan',
    alt: 'Snow-capped Tian Shan mountain peaks in Kazakhstan',
    dest: 'Shymkent, Kazakhstan',
  },
];

// Popular destinations — includes Kazakhstan gems
const SAMPLE_DESTINATIONS = [
  { name: 'Almaty', country: 'Kazakhstan', img: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&q=80', tag: 'Alpine' },
  { name: 'Charyn Canyon', country: 'Kazakhstan', img: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600&q=80', tag: 'Adventure' },
  { name: 'Varanasi', country: 'India', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&q=80', tag: 'Spiritual' },
  { name: 'Goa', country: 'India', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80', tag: 'Beach' },
  { name: 'Jaipur', country: 'India', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80', tag: 'Culture' },
  { name: 'Kolsai Lakes', country: 'Kazakhstan', img: 'https://images.unsplash.com/photo-1590766940554-b0e6d3231bca?w=600&q=80', tag: 'Nature' },
];

const EXPLORE_CITIES = [
  { name: 'Mumbai', tz: 'Asia/Kolkata', bbox: '72.75,18.85,73.05,19.25' },
  { name: 'Almaty', tz: 'Asia/Almaty', bbox: '76.7,43.1,77.1,43.5' },
  { name: 'London', tz: 'Europe/London', bbox: '-0.489,51.28,0.236,51.68' },
  { name: 'New York', tz: 'America/New_York', bbox: '-74.25,40.47,-73.70,40.91' },
  { name: 'Tokyo', tz: 'Asia/Tokyo', bbox: '139.56,35.52,139.91,35.81' },
  { name: 'Dubai', tz: 'Asia/Dubai', bbox: '55.10,24.95,55.50,25.35' },
];

// ── Kazakhstan Photo Carousel ──
function KazakhstanCarousel() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const prev = useCallback((e) => {
    e.stopPropagation();
    setCurrent(i => (i - 1 + KAZAKHSTAN_PHOTOS.length) % KAZAKHSTAN_PHOTOS.length);
  }, []);

  const next = useCallback((e) => {
    e.stopPropagation();
    setCurrent(i => (i + 1) % KAZAKHSTAN_PHOTOS.length);
  }, []);

  const photo = KAZAKHSTAN_PHOTOS[current];

  return (
    <div className={styles.carousel} aria-label="Kazakhstan destinations gallery">
      <div className={styles.carouselTrack} style={{ transform: `translateX(-${current * 100}%)` }}>
        {KAZAKHSTAN_PHOTOS.map((p, i) => (
          <img
            key={i}
            src={p.url}
            alt={p.alt}
            className={styles.carouselImg}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Caption */}
      <div className={styles.carouselCaption}>
        <MapPin size={12} aria-hidden="true" />
        {photo.caption}
      </div>

      {/* Navigation */}
      <button
        className={`${styles.carouselBtn} ${styles.carouselPrev}`}
        onClick={prev}
        aria-label="Previous photo"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        className={`${styles.carouselBtn} ${styles.carouselNext}`}
        onClick={next}
        aria-label="Next photo"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className={styles.carouselDots} role="tablist" aria-label="Photo navigation">
        {KAZAKHSTAN_PHOTOS.map((_, i) => (
          <button
            key={i}
            className={`${styles.carouselDot} ${i === current ? styles.dotActive : ''}`}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            role="tab"
            aria-selected={i === current}
            aria-label={`Photo ${i + 1}: ${KAZAKHSTAN_PHOTOS[i].caption}`}
          />
        ))}
      </div>

      {/* Plan this destination CTA — navigates to the photo's specific destination */}
      <button
        className={styles.carouselPlan}
        onClick={() => navigate(`/plan?dest=${encodeURIComponent(photo.dest || 'Kazakhstan')}`)}
        aria-label={`Plan a trip to ${photo.caption}`}
      >
        Plan {photo.dest?.split(',')[0]} Trip <ArrowRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

// ── Interactive Map — city buttons on left, iframe on right (no overlay)
// The overlay was blocking city button clicks; navigation handled by left-panel button only
function ExploreMap() {
  const navigate = useNavigate();
  const [activeCity, setActiveCity] = useState(EXPLORE_CITIES[0]);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  const handleMapClick = useCallback(() => {
    navigate(`/plan?dest=${encodeURIComponent(activeCity.name)}`);
  }, [navigate, activeCity]);

  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(activeCity.name)}&zoom=11`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${activeCity.bbox}&layer=mapnik`;

  return (
    <div className={styles.mapExplore}>
      <div className={styles.mapLeft}>
        <h3 className={styles.mapTitle}>📍 Explore on the Map</h3>
        <p className={styles.mapDesc}>
          Select a city to see its local time and map. Click the button to start planning.
        </p>

        <div className={styles.cityButtons}>
          {EXPLORE_CITIES.map(c => (
            <button
              key={c.name}
              className={`${styles.cityBtn} ${activeCity.name === c.name ? styles.activeCity : ''}`}
              onClick={() => setActiveCity(c)}
              aria-label={`Select ${c.name}`}
            >
              <MapPin size={12} /> {c.name}
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

      {/* Map iframe — no overlay so user can scroll/interact with it freely */}
      <div className={styles.mapRight}>
        <iframe
          src={mapSrc}
          title={`${activeCity.name} Map`}
          className={styles.mapFrame}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          aria-label={`Interactive map of ${activeCity.name}`}
        />
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  // Navigate to /plan with dest param — the Planner page reads ?dest= and sets state
  const handleDestClick = useCallback((destName) => {
    navigate(`/plan?dest=${encodeURIComponent(destName)}`);
  }, [navigate]);

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className="container">
          <div className={styles.heroGrid}>
            {/* Left: text content */}
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

              <div className={`${styles.kazakhTag} animate-fade-in-up`}>
                <span>✨ Featuring Kazakhstan — Central Asia's hidden gem</span>
              </div>
            </div>

            {/* Right: Kazakhstan photo carousel */}
            <div className={`${styles.heroVisual} animate-scale-in`}>
              <KazakhstanCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* ── POPULAR DESTINATIONS ── */}
      <section className={styles.destinations} aria-labelledby="destinations-heading">
        <div className="container">
          <h2 id="destinations-heading" className={styles.sectionHeading}>Popular Destinations</h2>
          <p className={styles.destSubtitle}>Click any destination to instantly pre-fill your trip planner</p>
          <div className={`${styles.destGrid} stagger`}>
            {SAMPLE_DESTINATIONS.map((d) => (
              <button
                key={d.name}
                className={styles.destCard}
                onClick={() => handleDestClick(d.name)}
                aria-label={`Plan a trip to ${d.name}, ${d.country} — click to open planner`}
              >
                <img src={d.img} alt={`${d.name} landscape`} className={styles.destImg} loading="lazy" />
                <div className={styles.destOverlay}>
                  <span className={`badge badge-primary ${styles.destTag}`}>{d.tag}</span>
                  <div>
                    <div className={styles.destName}>{d.name}</div>
                    <div className={styles.destCountry}>
                      <MapPin size={12} aria-hidden="true" /> {d.country}
                    </div>
                  </div>
                  <div className={styles.destCta}>
                    Plan this trip <ArrowRight size={12} aria-hidden="true" />
                  </div>
                </div>
              </button>
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
