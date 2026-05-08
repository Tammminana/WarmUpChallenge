import { Link } from 'react-router-dom';
import { MapPin, Zap, Shield, Globe, ArrowRight, Star, Clock, Wallet } from 'lucide-react';
import styles from './Landing.module.css';

const FEATURES = [
  {
    icon: <Zap size={24} aria-hidden="true" />,
    title: 'AI-Powered Itineraries',
    desc: 'Gemini generates a full day-by-day plan in seconds — tailored to your budget, style, and pace.',
    color: 'purple',
  },
  {
    icon: <Wallet size={24} aria-hidden="true" />,
    title: 'Smart Budget Tracker',
    desc: 'Real-time cost estimates for every activity. Get alerts before you overspend.',
    color: 'orange',
  },
  {
    icon: <Globe size={24} aria-hidden="true" />,
    title: 'Multilingual Ready',
    desc: 'Plan your trip in any language. Wanderly understands your travel prompts globally.',
    color: 'teal',
  },
  {
    icon: <Shield size={24} aria-hidden="true" />,
    title: 'Accessible for All',
    desc: 'Built with screen readers, keyboard navigation, and high-contrast support from day one.',
    color: 'rose',
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
  { name: 'Jaipur', country: 'India', img: 'https://images.unsplash.com/photo-1477587458883-47145ed31459?w=600&q=80', tag: 'Culture' },
];

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

            <div className={`${styles.heroStats} animate-fade-in-up`}>
              <div className={styles.stat}>
                <span className={styles.statNum}>10s</span>
                <span className={styles.statLabel}>Itinerary in</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.stat}>
                <span className={styles.statNum}>100%</span>
                <span className={styles.statLabel}>Personalized</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.stat}>
                <span className={styles.statNum}>Free</span>
                <span className={styles.statLabel}>To use</span>
              </div>
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

      {/* ── FEATURES ── */}
      <section id="features" className={styles.features} aria-labelledby="features-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 id="features-heading" className="section-title">Everything you need to travel smarter</h2>
            <p className="section-subtitle">Built with Google AI at its core — not just a list generator, but a real travel brain.</p>
          </div>
          <div className={`${styles.featGrid} stagger`}>
            {FEATURES.map((f) => (
              <div key={f.title} className={`card ${styles.featCard} ${styles[`color-${f.color}`]}`}>
                <div className={`${styles.featIcon} ${styles[`icon-${f.color}`]}`}>{f.icon}</div>
                <h3 className={styles.featTitle}>{f.title}</h3>
                <p className={styles.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
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
          <div className={styles.footerLinks}>
            <span className={`badge badge-teal`}>
              <Clock size={10} aria-hidden="true" /> Lightweight · Under 10MB
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
