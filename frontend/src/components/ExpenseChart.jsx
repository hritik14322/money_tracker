import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

// Custom colors mapping to our CSS design tokens
const COLORS = {
  Food: '#6366f1',          // Indigo
  Transport: '#a855f7',     // Purple
  Bills: '#f59e0b',         // Amber/Orange
  Entertainment: '#ec4899', // Pink
  Other: '#10b981'          // Teal
};

export default function ExpenseChart({ expenses }) {
  // Aggregate expenses by category
  const dataMap = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {});

  expenses.forEach(e => {
    if (CATEGORIES.includes(e.category)) {
      dataMap[e.category] += e.amount;
    }
  });

  const chartData = Object.keys(dataMap)
    .map(category => ({
      name: category,
      value: dataMap[category]
    }))
    .filter(item => item.value > 0); // Only display categories with spending

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, color: COLORS[data.name] }}>{data.name}</p>
          <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: '#f8fafc' }}>
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegendText = (value, entry) => {
    const item = chartData.find(d => d.name === value);
    const amountStr = item ? ` (${formatCurrency(item.value)})` : '';
    return <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>{value}{amountStr}</span>;
  };

  return (
    <div className="glass-card span-8">
      <h3 className="chart-container-title">Category Spending Breakdown</h3>
      <div className="chart-wrapper">
        {chartData.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <span className="empty-state-title">No Chart Data</span>
            <p>Add some expenses or adjust filters to view the category breakdown.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={renderLegendText}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
