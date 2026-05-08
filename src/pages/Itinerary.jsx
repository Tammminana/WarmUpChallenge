import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Wallet, Trash2, Edit3, Share2, Printer, ArrowRight, Plus } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { exportAsPDF, nativeShare } from '../utils/share';
import styles from './Itinerary.module.css';

export default function Itinerary() {
  const { savedTrips, deleteTrip, editTrip, loadTrip } = useTrip();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  const handleLoad = (id) => {
    loadTrip(id);
    navigate('/plan');
  };

  const handleEdit = (trip) => {
    setEditingId(trip.id);
    setEditTitle(trip.tripTitle || '');
    setEditDate(trip.scheduledDate?.split('T')[0] || '');
  };

  const handleSaveEdit = (id) => {
    editTrip(id, { tripTitle: editTitle, scheduledDate: editDate ? new Date(editDate).toISOString() : undefined });
    setEditingId(null);
  };

  const handleShare = async (trip) => {
    const success = await nativeShare(trip);
    if (success) alert('Trip link copied / shared!');
    else alert('Could not share. Try again.');
  };

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>📋 My Itineraries</h1>
            <p className={styles.subtitle}>All your AI-generated trip plans, saved locally in your browser. Edit, share, or export anytime.</p>
          </div>
          <Link to="/plan" className="btn btn-primary">
            <Plus size={16} aria-hidden="true" /> New Trip
          </Link>
        </header>

        {savedTrips.length === 0 ? (
          <div className={styles.emptyState}>
            <MapPin size={48} aria-hidden="true" />
            <h2>No trips saved yet</h2>
            <p>Plan your first trip with AI, then save it to see it here.</p>
            <Link to="/plan" className="btn btn-primary btn-lg">
              Plan My First Trip <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className={styles.tripList}>
            {savedTrips.map((trip) => (
              <article key={trip.id} className={`card ${styles.tripCard}`}>
                {editingId === trip.id ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={styles.editField}
                      placeholder="Trip title"
                      aria-label="Edit trip title"
                    />
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className={styles.editField}
                      aria-label="Edit scheduled date"
                    />
                    <div className={styles.editActions}>
                      <button onClick={() => handleSaveEdit(trip.id)} className="btn btn-primary btn-sm">Save</button>
                      <button onClick={() => setEditingId(null)} className="btn btn-outline btn-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.tripMain}>
                      <h3 className={styles.tripTitle}>{trip.tripTitle || 'Untitled Trip'}</h3>
                      <div className={styles.tripMeta}>
                        <span><MapPin size={12} /> {trip.destination}</span>
                        <span><Calendar size={12} /> {trip.duration}</span>
                        <span><Wallet size={12} /> {trip.totalBudget}</span>
                      </div>
                      {trip.scheduledDate && (
                        <p className={styles.scheduledDate}>
                          📅 Scheduled: {new Date(trip.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      <p className={styles.tripCreated}>
                        Created {new Date(trip.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className={styles.tripActions}>
                      <button onClick={() => handleLoad(trip.id)} className="btn btn-primary btn-sm" title="Open in planner">
                        <ArrowRight size={14} /> Open
                      </button>
                      <button onClick={() => handleEdit(trip)} className={styles.iconBtn} title="Edit trip">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleShare(trip)} className={styles.iconBtn} title="Share trip">
                        <Share2 size={14} />
                      </button>
                      <button onClick={() => exportAsPDF(trip)} className={styles.iconBtn} title="Export as PDF">
                        <Printer size={14} />
                      </button>
                      <button onClick={() => deleteTrip(trip.id)} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete trip">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
