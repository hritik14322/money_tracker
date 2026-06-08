# FinPulse - Personal Expense & Budget Tracker

FinPulse is an intuitive, premium, single-user personal finance tracker. It provides a visual dashboard to log daily expenses across categories (Food, Transport, Bills, Entertainment, and Other), trace spending patterns through interactive charts, set customized monthly category budgets, and obtain real-time visual overload alerts when spending exceeds active thresholds. All transaction data is stored and persisted in a backend JSON ledger.

## Live Demo Links
- **Local Host URL**: http://localhost:5173 (React Frontend)
- **Local API Endpoint**: http://localhost:5001 (Express Backend)

---

## Tech Stack & Libraries

### Frontend
- **React (via Vite)**: Scaffolded for high performance, hot-reloading, and minimal build size.
- **Vanilla CSS**: Designed with custom properties, responsive grids, and modern glassmorphism panels. No utility CSS frameworks (like Tailwind) are utilized.
- **Lucide React**: Integrated for sleek, lightweight dashboard and control icons.
- **Recharts**: Integrated to draw animated category-based spending breakdown charts.

### Backend
- **Node.js & Express**: Provides a robust, lightweight REST API.
- **JSON File Persistence**: Data is written directly to `backend/data/expenses.json` to persist expenses across restarts.
- **Jest & Supertest**: Structured to run robust integration tests validating endpoints and data shapes.

---

## How to Run Locally

To launch this application locally, you only need **Node.js** installed on your computer.

### 1. Clone or navigate to the project root directory
Open your terminal inside the `expense tracker` root directory.

### 2. Install dependencies for all workspace components
Run this command from the root folder to automatically install packages for the workspace, backend, and frontend:
```bash
npm run install-all
```

### 3. Start development servers
Run the dev orchestrator command:
```bash
npm run dev
```
*This starts both the Express backend on `http://localhost:5000` and the React frontend on `http://localhost:5173` concurrently.*

### 4. Run automated tests (Optional)
Run the backend test suite:
```bash
npm test --prefix backend
```

---

## API Documentation

All request and response shapes are in JSON.

### 1. Expenses Endpoints

#### Get All Expenses
- **Method**: `GET`
- **Path**: `/api/expenses`
- **Response Body**:
  ```json
  {
    "expenses": [
      {
        "id": "exp-123456",
        "amount": 1200.50,
        "category": "Food",
        "date": "2026-06-05",
        "note": "Weekly groceries"
      }
    ]
  }
  ```

#### Create a New Expense
- **Method**: `POST`
- **Path**: `/api/expenses`
- **Request Body**:
  ```json
  {
    "amount": 450.00,
    "category": "Food",
    "date": "2026-06-08",
    "note": "Lunch with team"
  }
  ```
- **Response Body**:
  ```json
  {
    "expense": {
      "id": "exp-789012",
      "amount": 450.00,
      "category": "Food",
      "date": "2026-06-08",
      "note": "Lunch with team"
    }
  }
  ```

#### Edit an Existing Expense
- **Method**: `PUT`
- **Path**: `/api/expenses/:id`
- **Request Body**:
  ```json
  {
    "amount": 500.00,
    "category": "Food",
    "date": "2026-06-08",
    "note": "Lunch with team (adjusted)"
  }
  ```
- **Response Body**:
  ```json
  {
    "expense": {
      "id": "exp-789012",
      "amount": 500.00,
      "category": "Food",
      "date": "2026-06-08",
      "note": "Lunch with team (adjusted)"
    }
  }
  ```

#### Delete an Expense
- **Method**: `DELETE`
- **Path**: `/api/expenses/:id`
- **Response Body**:
  ```json
  {
    "success": true
  }
  ```

---

### 2. Budget Settings Endpoints

#### Get Category Budgets
- **Method**: `GET`
- **Path**: `/api/budgets`
- **Response Body**:
  ```json
  {
    "budgets": {
      "Food": 5000,
      "Transport": 2000,
      "Bills": 10000,
      "Entertainment": 3000,
      "Other": 1500
    }
  }
  ```

#### Update Budgets
- **Method**: `PUT`
- **Path**: `/api/budgets`
- **Request Body**:
  ```json
  {
    "Food": 6000,
    "Transport": 2500
  }
  ```
- **Response Body**:
  ```json
  {
    "budgets": {
      "Food": 6000,
      "Transport": 2500,
      "Bills": 10000,
      "Entertainment": 3000,
      "Other": 1500
    }
  }
  ```

---

## Project Structure

```
expense tracker/
├── backend/
│   ├── __tests__/            # Backend Jest tests
│   │   └── server.test.js
│   ├── data/                 # JSON file storage directory
│   │   └── expenses.json
│   ├── package.json          # Node/Express scripts & deps
│   └── server.js             # API server and input validator logic
├── frontend/
│   ├── src/
│   │   ├── components/       # Modular UI components
│   │   │   ├── BudgetModal.jsx
│   │   │   ├── ExpenseChart.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseTable.jsx
│   │   │   └── SummaryCards.jsx
│   │   ├── App.jsx           # Core layout and state container
│   │   ├── index.css         # Dark glassmorphic styling system
│   │   └── main.jsx          # Entry point
│   ├── index.html            # Webpage container (SEO optimized)
│   ├── package.json          # Vite/React scripts & deps
│   └── vite.config.js
├── package.json              # Workspace start-up scripts
└── README.md                 # System overview and instruction manual
```

---

## Next Steps

### Trade-offs & Decisions
1. **In-Memory File IO**: Express directly reads/writes to `expenses.json`. While highly effective for a single-user prototype, it lacks transaction locks. A sqlite db or PostgreSQL would be implemented for scale.
2. **Localhost CORS**: API connects directly to port `5000` via localhost. In production, we'd bundle the frontend dist and serve it statically from the Express server to eliminate CORS.

### Next Roadmap Features
- **Multi-user Authentication**: Connect Firebase Auth or OAuth to separate data scopes.
- **Historical Reporting**: Support visual line charts indicating spending changes over years.
- **Receipt Parsing**: Let users upload transaction receipts and extract information via OCR.
