const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = process.env.NODE_ENV === 'test'
  ? path.join(__dirname, 'data', 'expenses.test.json')
  : path.join(__dirname, 'data', 'expenses.json');
const VALID_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

// Helper to read data
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { 
        expenses: [], 
        budgets: { Food: 5000, Transport: 2000, Bills: 10000, Entertainment: 3000, Other: 1500 } 
      };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { 
      expenses: [], 
      budgets: { Food: 5000, Transport: 2000, Bills: 10000, Entertainment: 3000, Other: 1500 } 
    };
  }
}

// Helper to write data
function writeData(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

// Validation middleware
function validateExpense(req, res, next) {
  const { amount, category, date, note } = req.body;

  // Amount validation: positive number
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number greater than 0.' });
  }

  // Category validation
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Category is required and must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  // Date validation: YYYY-MM-DD
  if (!date) {
    return res.status(400).json({ error: 'Date is required.' });
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format.' });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date.' });
  }

  // Check that the date is not in the future compared to server local date
  const todayStr = new Date().toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD in local time
  if (date > todayStr) {
    return res.status(400).json({ error: 'Date cannot be in the future.' });
  }

  req.validatedExpense = {
    amount: numericAmount,
    category,
    date,
    note: note ? String(note).trim() : ''
  };
  next();
}

// API Routes
const router = express.Router();

// Get all expenses
router.get('/expenses', (req, res) => {
  const data = readData();
  res.json({ expenses: data.expenses });
});

// Add an expense
router.post('/expenses', validateExpense, (req, res) => {
  const data = readData();
  const newExpense = {
    id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11),
    ...req.validatedExpense
  };
  data.expenses.push(newExpense);
  writeData(data);
  res.status(201).json({ expense: newExpense });
});

// Edit an expense
router.put('/expenses/:id', validateExpense, (req, res) => {
  const { id } = req.params;
  const data = readData();
  const index = data.expenses.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found.' });
  }

  const updatedExpense = {
    id,
    ...req.validatedExpense
  };
  data.expenses[index] = updatedExpense;
  writeData(data);
  res.json({ expense: updatedExpense });
});

// Delete an expense
router.delete('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  const initialLength = data.expenses.length;
  data.expenses = data.expenses.filter(e => e.id !== id);
  
  if (data.expenses.length === initialLength) {
    return res.status(404).json({ error: 'Expense not found.' });
  }

  writeData(data);
  res.json({ success: true });
});

// Get budgets
router.get('/budgets', (req, res) => {
  const data = readData();
  res.json({ budgets: data.budgets || {} });
});

// Update budgets
router.put('/budgets', (req, res) => {
  const budgets = req.body;
  
  if (!budgets || typeof budgets !== 'object') {
    return res.status(400).json({ error: 'Invalid budgets format.' });
  }

  for (const cat of VALID_CATEGORIES) {
    if (budgets[cat] !== undefined) {
      const val = parseFloat(budgets[cat]);
      if (isNaN(val) || val < 0) {
        return res.status(400).json({ error: `Budget for ${cat} must be a non-negative number.` });
      }
    }
  }

  const data = readData();
  data.budgets = {
    ...data.budgets,
    ...budgets
  };
  writeData(data);
  res.json({ budgets: data.budgets });
});

// Mount the router for local and production prefixes
app.use('/api', router);
app.use('/_/backend/api', router);

const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; // Export for testing
