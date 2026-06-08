process.env.NODE_ENV = 'test';

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');

const TEST_DATA_FILE = path.join(__dirname, '..', 'data', 'expenses.test.json');

const initialTestData = {
  expenses: [
    {
      id: 'test-1',
      amount: 1000,
      category: 'Food',
      date: '2026-06-01',
      note: 'Test Groceries'
    },
    {
      id: 'test-2',
      amount: 500,
      category: 'Transport',
      date: '2026-06-02',
      note: 'Test Cab'
    }
  ],
  budgets: {
    Food: 3000,
    Transport: 1000,
    Bills: 5000,
    Entertainment: 2000,
    Other: 1000
  }
};

describe('Expense Tracker API', () => {
  beforeEach(() => {
    // Write standard initial data before each test
    const dir = path.dirname(TEST_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(initialTestData, null, 2), 'utf8');
  });

  afterAll(() => {
    // Cleanup the test database file
    try {
      if (fs.existsSync(TEST_DATA_FILE)) {
        fs.unlinkSync(TEST_DATA_FILE);
      }
    } catch (err) {
      console.error('Failed to delete test file during cleanup:', err);
    }
  });

  describe('GET /api/expenses', () => {
    it('should retrieve all expenses', async () => {
      const res = await request(app).get('/api/expenses');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('expenses');
      expect(res.body.expenses.length).toEqual(2);
      expect(res.body.expenses[0].id).toEqual('test-1');
    });
  });

  describe('POST /api/expenses', () => {
    it('should successfully add a valid expense', async () => {
      const newExp = {
        amount: 250.75,
        category: 'Food',
        date: '2026-06-03',
        note: 'Valid breakfast'
      };

      const res = await request(app)
        .post('/api/expenses')
        .send(newExp);

      expect(res.statusCode).toEqual(201);
      expect(res.body.expense).toHaveProperty('id');
      expect(res.body.expense.amount).toEqual(250.75);
      expect(res.body.expense.category).toEqual('Food');
      expect(res.body.expense.date).toEqual('2026-06-03');
      expect(res.body.expense.note).toEqual('Valid breakfast');

      // Verify it was written to file
      const data = JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf8'));
      expect(data.expenses.length).toEqual(3);
    });

    it('should reject a negative amount', async () => {
      const invalidExp = {
        amount: -50,
        category: 'Food',
        date: '2026-06-03',
        note: 'Invalid negative amount'
      };

      const res = await request(app)
        .post('/api/expenses')
        .send(invalidExp);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject a future date', async () => {
      // Create a future date (e.g. year 2099)
      const invalidExp = {
        amount: 100,
        category: 'Food',
        date: '2099-12-31',
        note: 'Future date'
      };

      const res = await request(app)
        .post('/api/expenses')
        .send(invalidExp);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('cannot be in the future');
    });

    it('should reject an invalid category', async () => {
      const invalidExp = {
        amount: 100,
        category: 'LuxuryGoods', // Invalid
        date: '2026-06-03',
        note: 'Invalid category'
      };

      const res = await request(app)
        .post('/api/expenses')
        .send(invalidExp);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update an existing expense', async () => {
      const updatedData = {
        amount: 1200,
        category: 'Food',
        date: '2026-06-01',
        note: 'Updated Groceries Cost'
      };

      const res = await request(app)
        .put('/api/expenses/test-1')
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.expense.amount).toEqual(1200);
      expect(res.body.expense.note).toEqual('Updated Groceries Cost');

      // Verify file matches
      const data = JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf8'));
      expect(data.expenses.find(e => e.id === 'test-1').amount).toEqual(1200);
    });

    it('should return 404 for editing a non-existent expense', async () => {
      const res = await request(app)
        .put('/api/expenses/missing-id')
        .send({
          amount: 100,
          category: 'Food',
          date: '2026-06-01',
          note: 'Fail edit'
        });

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should remove the expense from memory and file', async () => {
      const res = await request(app).delete('/api/expenses/test-2');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ success: true });

      const data = JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf8'));
      expect(data.expenses.length).toEqual(1);
      expect(data.expenses.find(e => e.id === 'test-2')).toBeUndefined();
    });

    it('should return 404 for deleting a non-existent expense', async () => {
      const res = await request(app).delete('/api/expenses/missing-id');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('Budgets API', () => {
    it('should retrieve budgets', async () => {
      const res = await request(app).get('/api/budgets');
      expect(res.statusCode).toEqual(200);
      expect(res.body.budgets.Food).toEqual(3000);
    });

    it('should update budgets successfully', async () => {
      const updatedBudgets = {
        Food: 4000,
        Transport: 1500
      };

      const res = await request(app)
        .put('/api/budgets')
        .send(updatedBudgets);

      expect(res.statusCode).toEqual(200);
      expect(res.body.budgets.Food).toEqual(4000);
      expect(res.body.budgets.Transport).toEqual(1500);

      // Verify file persistence
      const data = JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf8'));
      expect(data.budgets.Food).toEqual(4000);
    });
  });
});
