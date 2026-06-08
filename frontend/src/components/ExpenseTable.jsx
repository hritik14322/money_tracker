import React from 'react';
import { Edit2, Trash2, Download, Inbox } from 'lucide-react';

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  // Sort expenses newest first
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val);
  };

  const formatDate = (dateStr) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    // To prevent timezone offset issues, split by '-' and create date locally
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', options);
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Food': return 'category-badge badge-food';
      case 'Transport': return 'category-badge badge-transport';
      case 'Bills': return 'category-badge badge-bills';
      case 'Entertainment': return 'category-badge badge-entertainment';
      default: return 'category-badge badge-other';
    }
  };

  const handleExportCSV = () => {
    if (sortedExpenses.length === 0) return;

    const headers = ['ID', 'Date', 'Category', 'Amount (INR)', 'Note'];
    const rows = sortedExpenses.map(e => [
      e.id,
      e.date,
      e.category,
      e.amount,
      // Wrap note in quotes and escape internal quotes to ensure CSV safety
      `"${(e.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const dateStr = new Date().toLocaleDateString('en-CA');
    link.setAttribute('download', `expense_tracker_export_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card table-card span-12">
      <div className="table-header-row">
        <h3 className="table-title">Expenses Log</h3>
        {sortedExpenses.length > 0 && (
          <button className="btn btn-secondary btn-icon" onClick={handleExportCSV} title="Export to CSV">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      <div className="table-container">
        {sortedExpenses.length === 0 ? (
          <div className="empty-state">
            <Inbox size={48} className="empty-state-icon" />
            <h4 className="empty-state-title">No expenses found</h4>
            <p>Log a new expense or clear your active filters to see items here.</p>
          </div>
        ) : (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th className="text-right">Amount</th>
                <th style={{ width: '100px' }}></th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.map(expense => (
                <tr key={expense.id}>
                  <td className="nowrap">{formatDate(expense.date)}</td>
                  <td>
                    <span className={getCategoryBadgeClass(expense.category)}>
                      {expense.category}
                    </span>
                  </td>
                  <td>
                    <div className="note-cell" title={expense.note}>
                      {expense.note || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                    </div>
                  </td>
                  <td className="text-right bold nowrap">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="action-btn action-btn-edit" 
                        onClick={() => onEdit(expense)}
                        title="Edit Expense"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        className="action-btn action-btn-delete" 
                        onClick={() => onDelete(expense.id)}
                        title="Delete Expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
