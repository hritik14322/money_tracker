import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

export default function ExpenseForm({ isOpen, onClose, expense, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(expense.date);
      setNote(expense.note || '');
    } else {
      // Set default date to today (YYYY-MM-DD in local time)
      const todayStr = new Date().toLocaleDateString('en-CA');
      setAmount('');
      setCategory('');
      setDate(todayStr);
      setNote('');
    }
    setErrors({});
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    const numAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = 'Amount is required.';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number greater than 0.';
    }

    if (!category) {
      newErrors.category = 'Category is required.';
    } else if (!CATEGORIES.includes(category)) {
      newErrors.category = 'Invalid category selected.';
    }

    if (!date) {
      newErrors.date = 'Date is required.';
    } else {
      const todayStr = new Date().toLocaleDateString('en-CA');
      if (date > todayStr) {
        newErrors.date = 'Date cannot be in the future.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      amount: parseFloat(amount),
      category,
      date,
      note: note.trim()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="expense-amount">Amount (₹)</label>
            <input
              type="number"
              id="expense-amount"
              className="form-control"
              placeholder="0.00"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
            {errors.amount && (
              <span className="error-message">
                <AlertCircle size={14} /> {errors.amount}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="expense-category">Category</label>
            <select
              id="expense-category"
              className="form-control"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <span className="error-message">
                <AlertCircle size={14} /> {errors.category}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="expense-date">Date</label>
            <input
              type="date"
              id="expense-date"
              className="form-control"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            {errors.date && (
              <span className="error-message">
                <AlertCircle size={14} /> {errors.date}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="expense-note">Note (Optional)</label>
            <textarea
              id="expense-note"
              className="form-control"
              placeholder="Add details (e.g. store, items bought)"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {expense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
