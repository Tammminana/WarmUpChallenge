import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, Compass } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} aria-label="Wanderly home">
          <div className={styles.logoIcon}>
            <Compass size={20} aria-hidden="true" />
          </div>
          <span className={styles.logoText}>Wanderly</span>
        </Link>

        <nav
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
          aria-label="Main navigation"
        >
          <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>Home</Link>
          <Link to="/itinerary" className={`${styles.navLink} ${isActive('/itinerary') ? styles.active : ''}`}>Itineraries</Link>
          <Link to="/plan" className={`${styles.navLink} ${isActive('/plan') ? styles.active : ''}`}>Plan Trip</Link>
          <Link to="/budget" className={`${styles.navLink} ${isActive('/budget') ? styles.active : ''}`}>Budget</Link>
          <Link to="/plan" className="btn btn-primary btn-sm">
            <MapPin size={14} aria-hidden="true" /> Start Planning
          </Link>
        </nav>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
