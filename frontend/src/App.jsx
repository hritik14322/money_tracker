import React, { useState, useEffect } from 'react';
import { Plus, Settings, AlertTriangle, Wallet, RefreshCw } from 'lucide-react';
import SummaryCards from './components/SummaryCards';
import ExpenseChart from './components/ExpenseChart';
import ExpenseTable from './components/ExpenseTable';
import ExpenseForm from './components/ExpenseForm';
import BudgetModal from './components/BudgetModal';

const API_BASE = 'http://localhost:5001/api';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('this-month'); // Default focus on current month
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Fetch all initial data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const expensesResponse = await fetch(`${API_BASE}/expenses`);
      if (!expensesResponse.ok) throw new Error('Failed to load expenses.');
      const expensesData = await expensesResponse.json();
      
      const budgetsResponse = await fetch(`${API_BASE}/budgets`);
      if (!budgetsResponse.ok) throw new Error('Failed to load budgets.');
      const budgetsData = await budgetsResponse.json();

      setExpenses(expensesData.expenses);
      setBudgets(budgetsData.budgets);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure it is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD API Calls
  const handleAddExpense = async (expenseData) => {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add expense.');
      }
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditExpense = async (expenseData) => {
    if (!editingExpense) return;
    try {
      const res = await fetch(`${API_BASE}/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to edit expense.');
      }
      setEditingExpense(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete expense.');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveBudgets = async (budgetsData) => {
    try {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetsData)
      });
      if (!res.ok) throw new Error('Failed to save budgets.');
      const data = await res.json();
      setBudgets(data.budgets);
    } catch (err) {
      alert(err.message);
    }
  };

  // Open forms helper
  const openAddModal = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  // Filter calculation
  const getFilteredExpenses = () => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
    
    // Get last month prefix
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthPrefix = lastMonth.toLocaleDateString('en-CA').substring(0, 7);

    return expenses.filter(expense => {
      // 1. Category filter
      if (categoryFilter && expense.category !== categoryFilter) {
        return false;
      }

      // 2. Date Range filter
      if (dateRangeFilter === 'this-month') {
        return expense.date.startsWith(currentMonthPrefix);
      } else if (dateRangeFilter === 'last-month') {
        return expense.date.startsWith(lastMonthPrefix);
      } else if (dateRangeFilter === 'custom') {
        if (customStartDate && expense.date < customStartDate) return false;
        if (customEndDate && expense.date > customEndDate) return false;
      }
      
      return true;
    });
  };

  const filteredExpenses = getFilteredExpenses();

  // Find exceeded budgets for alerts (specifically in the current month)
  const getBudgetOverruns = () => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const currentMonthPrefix = todayStr.substring(0, 7);
    const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));

    const categories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
    return categories
      .map(cat => {
        const spent = thisMonthExpenses
          .filter(e => e.category === cat)
          .reduce((sum, e) => sum + e.amount, 0);
        const budget = budgets[cat] || 0;
        return { category: cat, spent, budget, diff: spent - budget };
      })
      .filter(c => c.budget > 0 && c.spent > c.budget);
  };

  const budgetOverruns = getBudgetOverruns();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand-section">
          <Wallet className="brand-icon" size={32} />
          <h1 className="brand-title">FinPulse</h1>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setIsBudgetModalOpen(true)}>
            <Settings size={16} />
            <span>Budgets</span>
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </header>

      {/* Exceeded Budgets Alert Banner */}
      {budgetOverruns.length > 0 && (
        <div className="alert-banner">
          <AlertTriangle className="alert-icon" size={18} />
          <div>
            <strong>Budget Alert!</strong> You have exceeded spending limits this month in:{' '}
            {budgetOverruns.map((c, i) => (
              <span key={c.category}>
                {c.category} (by {formatCurrency(c.diff)}){i < budgetOverruns.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Dashboard UI */}
      {isLoading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <RefreshCw className="brand-icon" style={{ animation: 'spin 2s linear infinite' }} size={36} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Syncing with backend ledger...</p>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', borderColor: 'var(--danger)' }}>
          <AlertTriangle size={48} className="text-danger" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Connection Failure</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards Row */}
          <SummaryCards expenses={expenses} budgets={budgets} />

          {/* Filters & Controls */}
          <div className="glass-card filter-section" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="filter-group">
              <span className="filter-label">Filter Category:</span>
              <select
                className="form-control"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Date Range:</span>
              <select
                className="form-control"
                value={dateRangeFilter}
                onChange={e => setDateRangeFilter(e.target.value)}
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="custom">Custom Date Range</option>
                <option value="all">All-time History</option>
              </select>

              {dateRangeFilter === 'custom' && (
                <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="date"
                    className="form-control"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    placeholder="Start Date"
                  />
                  <span style={{ color: 'var(--text-muted)' }}>to</span>
                  <input
                    type="date"
                    className="form-control"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    placeholder="End Date"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Chart & Detailed Table Grid */}
          <div className="dashboard-grid">
            <ExpenseChart expenses={filteredExpenses} />
            <ExpenseTable 
              expenses={filteredExpenses} 
              onEdit={openEditModal} 
              onDelete={handleDeleteExpense} 
            />
          </div>
        </>
      )}

      {/* Modal Overlays */}
      <ExpenseForm
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expense={editingExpense}
        onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgets={budgets}
        onSave={handleSaveBudgets}
      />
    </div>
  );
}
