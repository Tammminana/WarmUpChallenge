import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import styles from './WorldClock.module.css';

export default function WorldClock({ timezone, city }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      try {
        const now = new Date();
        const opts = { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const dateOpts = { timeZone: timezone, weekday: 'short', month: 'short', day: 'numeric' };
        setTime(now.toLocaleTimeString('en-US', opts));
        setDate(now.toLocaleDateString('en-US', dateOpts));
      } catch {
        setTime(new Date().toLocaleTimeString());
        setDate(new Date().toLocaleDateString());
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className={styles.worldClock} aria-label={`Current time in ${city}`}>
      <Clock size={16} aria-hidden="true" />
      <div className={styles.clockInfo}>
        <span className={styles.clockCity}>{city}</span>
        <span className={styles.clockTime}>{time}</span>
        <span className={styles.clockDate}>{date}</span>
      </div>
    </div>
  );
}
