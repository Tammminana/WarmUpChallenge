import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import './App.css';

// Lazy-load heavy pages — app shell loads instantly
const Planner = lazy(() => import('./pages/Planner'));
const Budget = lazy(() => import('./pages/Budget'));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} aria-hidden="true" />
      <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <TripProvider>
      <div className="animated-bg" aria-hidden="true" />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/plan"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Planner />
              </Suspense>
            }
          />
          <Route
            path="/budget"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Budget />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </TripProvider>
  );
}
