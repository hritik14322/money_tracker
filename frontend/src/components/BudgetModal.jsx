import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

export default function BudgetModal({ isOpen, onClose, budgets, onSave }) {
  const [localBudgets, setLocalBudgets] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (budgets) {
      setLocalBudgets(budgets);
    }
  }, [budgets, isOpen]);

  if (!isOpen) return null;

  const handleChange = (category, value) => {
    setLocalBudgets(prev => ({
      ...prev,
      [category]: value
    }));
    
    // Validate instantly
    const num = parseFloat(value);
    if (value !== '' && (isNaN(num) || num < 0)) {
      setErrors(prev => ({
        ...prev,
        [category]: 'Budget must be a non-negative number.'
      }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Final validation
    const newErrors = {};
    const budgetsToSave = {};
    
    CATEGORIES.forEach(cat => {
      const val = localBudgets[cat];
      if (val === undefined || val === '') {
        budgetsToSave[cat] = 0;
      } else {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) {
          newErrors[cat] = 'Must be a non-negative number.';
        } else {
          budgetsToSave[cat] = num;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(budgetsToSave);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Configure Category Budgets</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="budget-grid">
            {CATEGORIES.map(category => (
              <div className="form-group" key={category}>
                <label htmlFor={`budget-${category}`}>{category} Budget</label>
                <input
                  type="number"
                  id={`budget-${category}`}
                  className="form-control"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={localBudgets[category] !== undefined ? localBudgets[category] : ''}
                  onChange={e => handleChange(category, e.target.value)}
                />
                {errors[category] && (
                  <span className="error-message">{errors[category]}</span>
                )}
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Budgets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
