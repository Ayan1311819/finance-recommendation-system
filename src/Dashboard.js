// Dashboard.js
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('finance_history');
    if (stored) {
      const parsed = JSON.parse(stored);
      setHistory(parsed);
      setFiltered(parsed);
    }
  }, []);

  const handleFilter = () => {
    if (!filterMonth && !filterYear) {
      setFiltered(history);
      return;
    }
    const filteredData = history.filter(entry => {
      const date = parseISO(entry.date);
      const matchMonth = filterMonth ? format(date, 'MM') === filterMonth : true;
      const matchYear = filterYear ? format(date, 'yyyy') === filterYear : true;
      return matchMonth && matchYear;
    });
    setFiltered(filteredData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📊 Finance Dashboard</h1>

      <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Month (MM)</label>
          <input
            type="text"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            placeholder="e.g. 07"
            className="w-24 p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year (YYYY)</label>
          <input
            type="text"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            placeholder="e.g. 2025"
            className="w-32 p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white p-4 rounded shadow">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#3b82f6" name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" />
              <Line type="monotone" dataKey="savings" stroke="#10b981" name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-600">No data to display.</p>
      )}
    </div>
  );
};

export default Dashboard;
