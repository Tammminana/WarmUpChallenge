import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import styles from '../pages/Planner.module.css';

// Typewriter placeholder texts for extra context field
const SEARCH_HINTS = [
  'Add extra details... e.g. vegetarian food only',
  'Preferences... e.g. avoid crowded places',
  'Special requests... e.g. wheelchair accessible',
  'Vibes... e.g. romantic getaway, party mode',
  'Budget style... e.g. luxury, backpacker, mid-range',
];

export default function AnimatedSearchInput({ value, onChange, disabled, placeholder }) {
  const [displayText, setDisplayText] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (value || disabled) return;
    const currentHint = SEARCH_HINTS[hintIndex];
    let timer;
    if (isTyping) {
      if (charIndex < currentHint.length) {
        timer = setTimeout(() => {
          setDisplayText(currentHint.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 45);
      } else {
        timer = setTimeout(() => setIsTyping(false), 1800);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentHint.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, 25);
      } else {
        setHintIndex((i) => (i + 1) % SEARCH_HINTS.length);
        setIsTyping(true);
      }
    }
    return () => clearTimeout(timer);
  }, [charIndex, isTyping, hintIndex, value, disabled]);

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
        placeholder={value ? '' : (placeholder || displayText + '|')}
        className={styles.input}
        disabled={disabled}
        aria-label="Additional trip preferences"
        aria-describedby="search-hint"
      />
    </div>
  );
}
