import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Plus, Trash2, ArrowRight, Clock } from 'lucide-react';
import { parseCost, getBudgetStatus } from '../utils/budgetUtils';
import styles from './Budget.module.css';

// World Clock — shows time at the selected destination
function WorldClock({ timezone, city }) {
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

const INDIAN_CITIES = [
  { city: 'Mumbai', tz: 'Asia/Kolkata' },
  { city: 'Delhi', tz: 'Asia/Kolkata' },
  { city: 'London', tz: 'Europe/London' },
  { city: 'New York', tz: 'America/New_York' },
  { city: 'Tokyo', tz: 'Asia/Tokyo' },
  { city: 'Dubai', tz: 'Asia/Dubai' },
];

const CATEGORIES = ['Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Misc'];

export default function Budget() {
  const [totalBudget, setTotalBudget] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const budget = parseCost(totalBudget) || 0;
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const status = getBudgetStatus(totalSpent, budget);

  const addExpense = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newAmount) return;
    setExpenses((prev) => [
      ...prev,
      { id: Date.now(), name: newName.trim(), amount: parseFloat(newAmount), category: newCategory },
    ]);
    setNewName('');
    setNewAmount('');
  };

  const removeExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Group expenses by category
  const grouped = useMemo(() => {
    const map = {};
    for (const exp of expenses) {
      if (!map[exp.category]) map[exp.category] = [];
      map[exp.category].push(exp);
    }
    return map;
  }, [expenses]);

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Wallet size={28} aria-hidden="true" /> Smart Budget Tracker
            </h1>
            <p className={styles.subtitle}>
              Track every rupee across your trip. Set your total budget, log expenses by category, and stay financially safe.
            </p>
          </div>
          <Link to="/plan" className="btn btn-primary">
            Plan a Trip <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>

        {/* World Clocks */}
        <section className={styles.clockRow} aria-label="World clocks">
          {INDIAN_CITIES.map((c) => (
            <WorldClock key={c.city} timezone={c.tz} city={c.city} />
          ))}
        </section>

        <div className={styles.layout}>
          {/* Left: Input + Summary */}
          <div className={styles.leftPanel}>
            {/* Budget Input */}
            <div className={`glass ${styles.budgetInput}`}>
              <label htmlFor="total-budget" className={styles.label}>Total Trip Budget</label>
              <input
                id="total-budget"
                type="text"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="e.g. ₹15,000"
                className={styles.field}
                aria-label="Enter your total trip budget"
              />
            </div>

            {/* Summary Card */}
            <div className={`glass ${styles.summaryCard}`}>
              <div className={styles.summaryRow}>
                <span>Budget</span>
                <strong>₹{budget.toLocaleString()}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Spent</span>
                <strong>₹{totalSpent.toLocaleString()}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Remaining</span>
                <strong style={{ color: remaining < 0 ? 'var(--rose-400)' : 'var(--teal-400)' }}>
                  ₹{remaining.toLocaleString()}
                </strong>
              </div>
              <div className={styles.progressBar} role="progressbar" aria-valuenow={Math.round(percentUsed)} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${percentUsed}%`, background: remaining < 0 ? 'var(--rose-500)' : 'var(--gradient-primary)' }}
                />
              </div>
              <div className={styles.statusBadge} style={{ color: `var(--${status.color}-400, var(--text-muted))` }}>
                {status.label}
              </div>
            </div>

            {/* Add Expense Form */}
            <form onSubmit={addExpense} className={`glass ${styles.addForm}`}>
              <h3 className={styles.formTitle}><Plus size={16} aria-hidden="true" /> Add Expense</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="What did you spend on?"
                className={styles.field}
                required
                aria-label="Expense description"
              />
              <div className={styles.formRow}>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="₹ Amount"
                  className={styles.field}
                  required
                  min="0"
                  step="0.01"
                  aria-label="Expense amount"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={styles.field}
                  aria-label="Expense category"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Expense
              </button>
            </form>
          </div>

          {/* Right: Expense List */}
          <div className={styles.rightPanel}>
            <h3 className={styles.listTitle}>Expenses ({expenses.length})</h3>
            {expenses.length === 0 ? (
              <div className={styles.emptyState}>
                <Wallet size={40} aria-hidden="true" />
                <p>No expenses yet. Add your first one!</p>
              </div>
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className={styles.categoryGroup}>
                  <h4 className={styles.categoryTitle}>
                    {cat}
                    <span className={styles.categoryTotal}>₹{items.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span>
                  </h4>
                  {items.map((exp) => (
                    <div key={exp.id} className={`card ${styles.expenseCard}`}>
                      <div className={styles.expenseInfo}>
                        <span className={styles.expenseName}>{exp.name}</span>
                        <span className={styles.expenseAmount}>₹{exp.amount.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => removeExpense(exp.id)}
                        className={styles.deleteBtn}
                        aria-label={`Remove ${exp.name}`}
                        title="Remove expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
