import React, { useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const App = () => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState({
    housing: '', food: '', transportation: '', entertainment: '', utilities: '', other: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem('finance_history');
    return stored ? JSON.parse(stored) : [];
  });

  const handleExpenseChange = (category, value) => {
    setExpenses(prev => ({ ...prev, [category]: value }));
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Medium': return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case 'Low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  const generateAnalysis = () => {
    const monthlyIncome = parseFloat(income) || 0;
    const totalExpenses = Object.values(expenses).reduce((sum, exp) => sum + (parseFloat(exp) || 0), 0);
    const savings = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
    const expensePercentages = {};
    Object.keys(expenses).forEach(category => {
      expensePercentages[category] = monthlyIncome > 0 ? ((parseFloat(expenses[category]) || 0) / monthlyIncome) * 100 : 0;
    });

    const priority = { high: [], medium: [], low: [] };
//We didn't use any complex ML models yet. We questioned the requirements and kept it simple. Financial principles/ Rule based
//Emergency Fund Rule (also sometimes called 3 months rule)
    if (savings > 0 && savings < monthlyIncome * 3) {
      priority.high.push({
        title: "Build Emergency Fund",
        description: `You need ₹${(monthlyIncome * 3).toLocaleString()} for 3-months. Current: ₹${savings.toLocaleString()}`,
        action: `Save ₹${Math.round((monthlyIncome * 3 - savings) / 6).toLocaleString()} monthly`
      });
    }
// 50/30/20 rule
    if (savingsRate < 10) {
      priority.high.push({
        title: "Increase Savings Rate",
        description: `You're saving ${savingsRate.toFixed(1)}%. Aim for 20%`,
        action: `Reduce expenses by ₹${Math.round(monthlyIncome * 0.2 - savings).toLocaleString()}`
      });
    } else if (savingsRate >= 20) {
      priority.low.push({
        title: "Excellent Savings Rate",
        description: `${savingsRate.toFixed(1)}% savings rate. Consider investing.`,
        action: "Explore SIP or mutual funds"
      });
    }
//30% Housing Rule
    if (expensePercentages.housing > 30) {
      priority.high.push({
        title: "High Housing Cost",
        description: `Housing is ${expensePercentages.housing.toFixed(1)}% of income`,
        action: "Try to cut rent or share housing"
      });
    }
// Simple Discretionary Spending Guidelines
    if (expensePercentages.food > 15) {
      priority.medium.push({
        title: "Food Expenses High",
        description: `Food is ${expensePercentages.food.toFixed(1)}% of income`,
        action: "Plan meals and cook at home"
      });
    }

    if (expensePercentages.entertainment > 10) {
      priority.medium.push({
        title: "Entertainment Budget High",
        description: `Entertainment is ${expensePercentages.entertainment.toFixed(1)}%`,
        action: "Set a fixed entertainment budget"
      });
    }
//Investing Readiness Rule or Emergency Fund. 
//We can send an API call to gemini to give some up to date investment strategies but its not reliable at this point so we thought of just go along with this first principle rule based simple approach.

    if (savingsRate > 20 && savings > monthlyIncome * 3) {
      priority.medium.push({
        title: "Ready for Investment",
        description: "Emergency fund and savings goals met",
        action: `Invest ₹${Math.round(savings * 0.6).toLocaleString()} in diversified portfolio`
      });
    }
//Basic Budgeting Principle: Don't spend more than you earn
    if (savings < 0) {
      priority.high.push({
        title: "Overspending",
        description: `You're overspending by ₹${Math.abs(savings).toLocaleString()}`,
        action: "Review non-essentials immediately"
      });
    }

    setRecommendations([
      ...priority.high.map(r => ({ ...r, priority: 'High' })),
      ...priority.medium.map(r => ({ ...r, priority: 'Medium' })),
      ...priority.low.map(r => ({ ...r, priority: 'Low' }))
    ]);

    const newEntry = {
      id: Date.now(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      income: monthlyIncome,
      expenses: totalExpenses,
      savings
    };

    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    localStorage.setItem('finance_history', JSON.stringify(updatedHistory));

    setAnalysis({
      totalIncome: monthlyIncome,
      totalExpenses,
      savings,
      savingsRate,
      expenseBreakdown: expensePercentages
    });
  };

  const openDashboardTab = () => {
    window.open('/dashboard', '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Finance Tracker</h1>
        </div>
        <button
          onClick={openDashboardTab}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <BarChart3 className="w-5 h-5" />
          <span>Open Dashboard</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <label className="block text-sm font-medium text-gray-700">Select Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            className="w-full p-2 border border-gray-300 rounded"
            dateFormat="yyyy-MM-dd"
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">Monthly Income (₹)</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />

          {Object.entries(expenses).map(([cat, val]) => (
            <div key={cat} className="mt-2">
              <label className="text-sm text-gray-700 capitalize">{cat}</label>
              <input
                type="number"
                value={val}
                onChange={(e) => handleExpenseChange(cat, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          ))}

          <button
            onClick={generateAnalysis}
            className="w-full bg-blue-600 text-white mt-4 py-2 rounded hover:bg-blue-700"
          >
            Analyze & Save
          </button>
        </div>

        {analysis && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <p>Income: ₹{analysis.totalIncome.toLocaleString()}</p>
            <p>Expenses: ₹{analysis.totalExpenses.toLocaleString()}</p>
            <p className={analysis.savings >= 0 ? 'text-green-600' : 'text-red-600'}>
              Net Savings: ₹{analysis.savings.toLocaleString()}
            </p>
            <p>Savings Rate: {analysis.savingsRate.toFixed(1)}%</p>
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white mt-6 p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Recommendations</h2>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="border p-3 rounded mb-2">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(rec.priority)}
                <h3 className="font-medium text-gray-800">{rec.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rec.priority === 'High' ? 'bg-red-100 text-red-600' :
                  rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                }`}>
                  {rec.priority} Priority
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
              <p className="text-blue-600 text-sm">💡 {rec.action}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;



