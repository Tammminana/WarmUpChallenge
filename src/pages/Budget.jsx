import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Plus, Trash2, ArrowRight, Edit3, Users, DollarSign } from 'lucide-react';
import { parseCost, getBudgetStatus } from '../utils/budgetUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTrip } from '../context/TripContext';
import styles from './Budget.module.css';

const CATEGORIES = ['Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Misc'];
const CURRENCIES = [
  { symbol: '₹', code: 'INR', label: '₹ INR' },
  { symbol: '$', code: 'USD', label: '$ USD' },
  { symbol: '€', code: 'EUR', label: '€ EUR' },
  { symbol: '£', code: 'GBP', label: '£ GBP' },
  { symbol: '¥', code: 'JPY', label: '¥ JPY' },
  { symbol: 'د.إ', code: 'AED', label: 'د.إ AED' },
];

export default function Budget() {
  const [totalBudget, setTotalBudget] = useLocalStorage('wanderly_totalBudget', '');
  const [currencyCode, setCurrencyCode] = useLocalStorage('wanderly_currency', 'INR');
  const [people, setPeople] = useLocalStorage('wanderly_people', ['Me']);
  const [expenses, setExpenses] = useLocalStorage('wanderly_expenses', []);

  const { savedTrips } = useTrip();

  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [newPerson, setNewPerson] = useState('');
  const [paidBy, setPaidBy] = useState('Me');
  const [splitAmong, setSplitAmong] = useState([]); // which people share this expense
  const [editingId, setEditingId] = useState(null);
  const [linkedTrip, setLinkedTrip] = useState('');

  const curr = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const budget = parseCost(totalBudget) || 0;
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const status = getBudgetStatus(totalSpent, budget);

  // Linked trip estimated budget
  const linked = savedTrips.find(t => t.id === linkedTrip);
  const linkedEstimate = linked ? parseCost(linked.totalBudget) : 0;

  const addPerson = (e) => {
    e.preventDefault();
    if (!newPerson.trim() || people.includes(newPerson.trim())) return;
    setPeople([...people, newPerson.trim()]);
    setNewPerson('');
  };

  const removePerson = (p) => {
    setPeople(people.filter(x => x !== p));
  };

  const toggleSplitPerson = (p) => {
    setSplitAmong(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const selectAllForSplit = () => setSplitAmong([...people]);

  const saveExpense = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newAmount) return;
    // Default: split among all people if none selected
    const finalSplit = splitAmong.length > 0 ? splitAmong : [...people];

    if (editingId) {
      setExpenses(prev => prev.map(exp =>
        exp.id === editingId
          ? { ...exp, name: newName.trim(), amount: parseFloat(newAmount), category: newCategory, paidBy, splitAmong: finalSplit }
          : exp
      ));
      setEditingId(null);
    } else {
      setExpenses(prev => [
        ...prev,
        { id: Date.now(), name: newName.trim(), amount: parseFloat(newAmount), category: newCategory, paidBy, splitAmong: finalSplit },
      ]);
    }
    setNewName('');
    setNewAmount('');
    setSplitAmong([]);
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setNewName(exp.name);
    setNewAmount(exp.amount.toString());
    setNewCategory(exp.category);
    setPaidBy(exp.paidBy || people[0]);
    setSplitAmong(exp.splitAmong || [...people]);
  };

  const removeExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const grouped = useMemo(() => {
    const map = {};
    for (const exp of expenses) {
      if (!map[exp.category]) map[exp.category] = [];
      map[exp.category].push(exp);
    }
    return map;
  }, [expenses]);

  // Per-person balances based on actual split selections
  const balances = useMemo(() => {
    const bals = {};
    people.forEach(p => (bals[p] = 0));
    if (people.length <= 1) return bals;

    expenses.forEach(exp => {
      const share = exp.splitAmong || people;
      const splitAmount = exp.amount / share.length;
      share.forEach(p => {
        if (bals[p] !== undefined) {
          if (p === exp.paidBy) {
            bals[p] += (exp.amount - splitAmount);
          } else {
            bals[p] -= splitAmount;
          }
        }
      });
    });
    return bals;
  }, [expenses, people]);

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <Wallet size={28} aria-hidden="true" /> Smart Budget & Split
            </h1>
            <p className={styles.subtitle}>
              Track trip expenses, split bills with friends, and stay within budget.
            </p>
          </div>
          <Link to="/plan" className="btn btn-primary">
            Plan a Trip <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>

        <div className={styles.layout}>
          {/* Left: Input + Summary */}
          <div className={styles.leftPanel}>
            {/* Currency + Budget */}
            <div className={`glass ${styles.budgetInput}`}>
              <label className={styles.label}>Currency</label>
              <select
                value={currencyCode}
                onChange={e => setCurrencyCode(e.target.value)}
                className={styles.field}
                aria-label="Select currency"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>

              <label htmlFor="total-budget" className={styles.label} style={{ marginTop: '12px' }}>Total Trip Budget</label>
              <input
                id="total-budget"
                type="text"
                value={totalBudget}
                onChange={e => setTotalBudget(e.target.value)}
                placeholder={`e.g. ${curr.symbol}15,000`}
                className={styles.field}
                aria-label="Enter your total trip budget"
              />
            </div>

            {/* Link to Itinerary */}
            {savedTrips.length > 0 && (
              <div className={`glass ${styles.linkSection}`}>
                <label className={styles.label}>Link to Itinerary</label>
                <select value={linkedTrip} onChange={e => setLinkedTrip(e.target.value)} className={styles.field} aria-label="Link budget to a saved trip">
                  <option value="">None</option>
                  {savedTrips.map(t => <option key={t.id} value={t.id}>{t.tripTitle} — {t.destination}</option>)}
                </select>
                {linked && (
                  <p className={styles.linkedInfo}>
                    📍 {linked.destination} · {linked.duration} · Est: {linked.totalBudget}
                  </p>
                )}
              </div>
            )}

            {/* Summary */}
            <div className={`glass ${styles.summaryCard}`}>
              <div className={styles.summaryRow}>
                <span>Budget</span>
                <strong>{curr.symbol}{budget.toLocaleString()}</strong>
              </div>
              {linkedEstimate > 0 && (
                <div className={styles.summaryRow}>
                  <span>AI Estimate</span>
                  <strong style={{ color: 'var(--primary-400)' }}>{curr.symbol}{linkedEstimate.toLocaleString()}</strong>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Spent</span>
                <strong>{curr.symbol}{totalSpent.toLocaleString()}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Remaining</span>
                <strong style={{ color: remaining < 0 ? 'var(--rose-400)' : 'var(--teal-400)' }}>
                  {curr.symbol}{remaining.toLocaleString()}
                </strong>
              </div>
              <div className={styles.progressBar} role="progressbar" aria-valuenow={Math.round(percentUsed)} aria-valuemin={0} aria-valuemax={100}>
                <div className={styles.progressFill} style={{ width: `${percentUsed}%`, background: remaining < 0 ? 'var(--rose-500)' : 'var(--gradient-primary)' }} />
              </div>
              <div className={styles.statusBadge} style={{ color: `var(--${status.color}-400, var(--text-muted))` }}>
                {status.label}
              </div>
            </div>

            {/* People */}
            <div className={`glass ${styles.peopleSection}`}>
              <h3 className={styles.formTitle}><Users size={16} /> Travelers ({people.length})</h3>
              <div className={styles.peopleList}>
                {people.map(p => (
                  <span key={p} className={styles.personTag}>
                    {p} {people.length > 1 && <button onClick={() => removePerson(p)} className={styles.removePerson} aria-label={`Remove ${p}`}>×</button>}
                  </span>
                ))}
              </div>
              <form onSubmit={addPerson} className={styles.personForm}>
                <input type="text" value={newPerson} onChange={e => setNewPerson(e.target.value)} placeholder="Add person..." className={styles.field} aria-label="Person name" />
                <button type="submit" className="btn btn-outline btn-sm">Add</button>
              </form>
            </div>

            {/* Expense Form */}
            <form onSubmit={saveExpense} className={`glass ${styles.addForm}`}>
              <h3 className={styles.formTitle}>
                {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
                {editingId ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="What did you spend on?" className={styles.field} required />
              <div className={styles.formRow}>
                <div className={styles.amountInput}>
                  <span className={styles.currBadge}>{curr.symbol}</span>
                  <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Amount" className={styles.field} required min="0" step="0.01" />
                </div>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className={styles.field} aria-label="Category">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {people.length > 1 && (
                <>
                  <div className={styles.formRow}>
                    <div>
                      <label className={styles.label}>Paid By</label>
                      <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className={styles.field}>
                        {people.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className={styles.splitHeader}>
                      <label className={styles.label}>Split Among</label>
                      <button type="button" onClick={selectAllForSplit} className={styles.selectAllBtn}>Select All</button>
                    </div>
                    <div className={styles.splitChips}>
                      {people.map(p => (
                        <button
                          key={p}
                          type="button"
                          className={`${styles.splitChip} ${splitAmong.includes(p) ? styles.splitActive : ''}`}
                          onClick={() => toggleSplitPerson(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    {splitAmong.length === 0 && <p className={styles.splitHint}>If none selected, splits among all</p>}
                  </div>
                </>
              )}
              <div className={styles.editActions}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Save Changes' : 'Add Expense'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setNewName(''); setNewAmount(''); setSplitAmong([]); }} className="btn btn-outline">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Expenses + Balances */}
          <div className={styles.rightPanel}>
            {people.length > 1 && expenses.length > 0 && (
              <div className={`glass ${styles.balancesCard}`}>
                <h3 className={styles.listTitle}>💸 Balances</h3>
                <div className={styles.balancesGrid}>
                  {Object.entries(balances).map(([p, bal]) => (
                    <div key={p} className={styles.balanceItem}>
                      <span>{p}</span>
                      <strong style={{ color: bal >= 0 ? 'var(--teal-400)' : 'var(--rose-400)' }}>
                        {bal >= 0 ? `Gets back ${curr.symbol}${Math.abs(bal).toFixed(2)}` : `Owes ${curr.symbol}${Math.abs(bal).toFixed(2)}`}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    <span className={styles.categoryTotal}>{curr.symbol}{items.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span>
                  </h4>
                  {items.map(exp => (
                    <div key={exp.id} className={`card ${styles.expenseCard}`}>
                      <div className={styles.expenseInfo}>
                        <div className={styles.expenseHeader}>
                          <span className={styles.expenseName}>{exp.name}</span>
                          <span className={styles.expenseAmount}>{curr.symbol}{exp.amount.toLocaleString()}</span>
                        </div>
                        {people.length > 1 && (
                          <div className={styles.expensePayer}>
                            Paid by {exp.paidBy || 'Unknown'} · Split: {(exp.splitAmong || people).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className={styles.expenseActions}>
                        <button onClick={() => startEdit(exp)} className={styles.iconBtn} title="Edit"><Edit3 size={14} /></button>
                        <button onClick={() => removeExpense(exp.id)} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Remove"><Trash2 size={14} /></button>
                      </div>
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
