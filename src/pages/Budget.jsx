import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Plus, Trash2, ArrowRight, Edit3, Users } from 'lucide-react';
import { parseCost, getBudgetStatus } from '../utils/budgetUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import styles from './Budget.module.css';

const CATEGORIES = ['Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Misc'];

export default function Budget() {
  const [totalBudget, setTotalBudget] = useLocalStorage('wanderly_totalBudget', '');
  const [people, setPeople] = useLocalStorage('wanderly_people', ['Me']);
  const [expenses, setExpenses] = useLocalStorage('wanderly_expenses', []);
  
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [newPerson, setNewPerson] = useState('');
  const [paidBy, setPaidBy] = useState('Me');
  const [editingId, setEditingId] = useState(null);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const budget = parseCost(totalBudget) || 0;
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const status = getBudgetStatus(totalSpent, budget);

  const addPerson = (e) => {
    e.preventDefault();
    if (!newPerson.trim() || people.includes(newPerson.trim())) return;
    setPeople([...people, newPerson.trim()]);
    setNewPerson('');
  };

  const removePerson = (p) => {
    setPeople(people.filter(x => x !== p));
  };

  const saveExpense = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newAmount) return;
    
    if (editingId) {
      setExpenses(prev => prev.map(exp => 
        exp.id === editingId 
          ? { ...exp, name: newName.trim(), amount: parseFloat(newAmount), category: newCategory, paidBy } 
          : exp
      ));
      setEditingId(null);
    } else {
      setExpenses((prev) => [
        ...prev,
        { id: Date.now(), name: newName.trim(), amount: parseFloat(newAmount), category: newCategory, paidBy },
      ]);
    }
    setNewName('');
    setNewAmount('');
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setNewName(exp.name);
    setNewAmount(exp.amount.toString());
    setNewCategory(exp.category);
    setPaidBy(exp.paidBy || people[0]);
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

  // Calculate balances (Splitwise logic: assuming equal split among all people for simplicity in this version, but tracking who paid)
  const balances = useMemo(() => {
    const bals = {};
    people.forEach(p => bals[p] = 0);
    if (people.length === 0) return bals;

    expenses.forEach(exp => {
      const splitAmount = exp.amount / people.length;
      people.forEach(p => {
        if (p === exp.paidBy) {
          bals[p] += (exp.amount - splitAmount);
        } else {
          bals[p] -= splitAmount;
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

            {/* People Management */}
            <div className={`glass ${styles.peopleSection}`}>
              <h3 className={styles.formTitle}><Users size={16} /> Travelers ({people.length})</h3>
              <div className={styles.peopleList}>
                {people.map(p => (
                  <span key={p} className={styles.personTag}>
                    {p} {people.length > 1 && <button onClick={() => removePerson(p)} className={styles.removePerson}>×</button>}
                  </span>
                ))}
              </div>
              <form onSubmit={addPerson} className={styles.personForm}>
                <input 
                  type="text" 
                  value={newPerson} 
                  onChange={e => setNewPerson(e.target.value)} 
                  placeholder="Add person..." 
                  className={styles.field}
                />
                <button type="submit" className="btn btn-outline btn-sm">Add</button>
              </form>
            </div>

            {/* Add/Edit Expense Form */}
            <form onSubmit={saveExpense} className={`glass ${styles.addForm}`}>
              <h3 className={styles.formTitle}>
                {editingId ? <Edit3 size={16} /> : <Plus size={16} />} 
                {editingId ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="What did you spend on?"
                className={styles.field}
                required
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
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={styles.field}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {people.length > 1 && (
                <div className={styles.formRow}>
                  <label className={styles.label}>Paid By:</label>
                  <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className={styles.field}>
                    {people.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}
              <div className={styles.editActions}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Save Changes' : 'Add Expense'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setNewName(''); setNewAmount(''); }} className="btn btn-outline">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Expense List & Balances */}
          <div className={styles.rightPanel}>
            {people.length > 1 && expenses.length > 0 && (
              <div className={`glass ${styles.balancesCard}`}>
                <h3 className={styles.listTitle}>Balances</h3>
                <div className={styles.balancesGrid}>
                  {Object.entries(balances).map(([p, bal]) => (
                    <div key={p} className={styles.balanceItem}>
                      <span>{p}</span>
                      <strong style={{ color: bal >= 0 ? 'var(--teal-400)' : 'var(--rose-400)' }}>
                        {bal >= 0 ? `Gets back ₹${bal.toFixed(2)}` : `Owes ₹${Math.abs(bal).toFixed(2)}`}
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
                    <span className={styles.categoryTotal}>₹{items.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span>
                  </h4>
                  {items.map((exp) => (
                    <div key={exp.id} className={`card ${styles.expenseCard}`}>
                      <div className={styles.expenseInfo}>
                        <div className={styles.expenseHeader}>
                          <span className={styles.expenseName}>{exp.name}</span>
                          <span className={styles.expenseAmount}>₹{exp.amount.toLocaleString()}</span>
                        </div>
                        {people.length > 1 && (
                          <div className={styles.expensePayer}>Paid by {exp.paidBy || 'Unknown'}</div>
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
