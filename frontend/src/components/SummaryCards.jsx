import React from 'react';
import { DollarSign, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SummaryCards({ expenses, budgets }) {
  // Get current month prefix: YYYY-MM
  const todayStr = new Date().toLocaleDateString('en-CA');
  const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-06"
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filter current month expenses
  const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));

  // 1. Total spent this month
  const totalSpentThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 2. Highest single expense (overall or this month - let's find the highest single overall)
  let highestExpense = null;
  if (expenses.length > 0) {
    highestExpense = expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0]);
  }

  // 3. Category spent vs budget this month
  const categories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
  const categorySummary = categories.map(cat => {
    const spent = thisMonthExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    const budget = budgets[cat] || 0;
    const ratio = budget > 0 ? (spent / budget) * 100 : 0;
    return {
      category: cat,
      spent,
      budget,
      ratio,
      isOver: spent > budget && budget > 0
    };
  });

  // Calculate currency format
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val);
  };

  const totalBudgets = Object.values(budgets).reduce((sum, b) => sum + b, 0);
  const budgetRatio = totalBudgets > 0 ? (totalSpentThisMonth / totalBudgets) * 100 : 0;

  return (
    <>
      {/* KPI Cards Row */}
      <div className="kpi-container">
        {/* Total Spent Card */}
        <div className="glass-card kpi-card kpi-primary">
          <div className="kpi-header">
            <span>Spent This Month ({currentMonthName})</span>
            <div className="kpi-icon-wrapper text-primary">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(totalSpentThisMonth)}</div>
          <div className="kpi-subtext">
            {totalBudgets > 0 ? (
              <span>
                {budgetRatio.toFixed(1)}% of total monthly budget ({formatCurrency(totalBudgets)})
              </span>
            ) : (
              <span>No budgets set</span>
            )}
          </div>
        </div>

        {/* Highest Expense Card */}
        <div className="glass-card kpi-card kpi-warning">
          <div className="kpi-header">
            <span>Highest Single Expense</span>
            <div className="kpi-icon-wrapper text-warning">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {highestExpense ? formatCurrency(highestExpense.amount) : formatCurrency(0)}
          </div>
          <div className="kpi-subtext">
            {highestExpense ? (
              <span>
                in <span className="bold">{highestExpense.category}</span> on {highestExpense.date}
              </span>
            ) : (
              <span>No expenses logged</span>
            )}
          </div>
        </div>

        {/* Budget Status Card */}
        <div className="glass-card kpi-card kpi-danger">
          <div className="kpi-header">
            <span>Budget Health</span>
            <div className="kpi-icon-wrapper text-danger">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {categorySummary.filter(c => c.isOver).length}
          </div>
          <div className="kpi-subtext">
            {categorySummary.some(c => c.isOver) ? (
              <span className="text-danger bold">Warning: Budgets exceeded!</span>
            ) : (
              <span className="text-success bold">All categories within budget limits</span>
            )}
          </div>
        </div>
      </div>

      {/* Category Budgets Breakdown Card */}
      <div className="glass-card span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 className="chart-container-title">Category Budgets ({currentMonthName})</h3>
        <div className="budget-progress-list">
          {categorySummary.map(({ category, spent, budget, ratio, isOver }) => {
            let barColorClass = 'progress-success';
            if (ratio >= 100) {
              barColorClass = 'progress-danger';
            } else if (ratio >= 80) {
              barColorClass = 'progress-warning';
            }

            return (
              <div className="budget-item" key={category}>
                <div className="budget-item-info">
                  <span className="budget-item-name">{category}</span>
                  <span className="budget-item-spent">
                    {formatCurrency(spent)} / {formatCurrency(budget)}
                  </span>
                </div>
                <div className="budget-progress-track">
                  <div 
                    className={`budget-progress-bar ${barColorClass}`}
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  />
                </div>
                {isOver && (
                  <span className="error-message" style={{ marginTop: '0.125rem' }}>
                    <AlertTriangle size={12} /> Budget exceeded by {formatCurrency(spent - budget)}!
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
