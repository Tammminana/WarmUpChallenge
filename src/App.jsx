import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Planner from './pages/Planner';
import './App.css';

export default function App() {
  return (
    <>
      <div className="animated-bg" aria-hidden="true" />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/plan" element={<Planner />} />
        </Routes>
      </main>
    </>
  );
}
