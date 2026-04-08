import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpenses = () => {
    api.get('/expenses').then(res => setExpenses(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/expenses', {
        ...form,
        amount: parseFloat(form.amount),
        date: form.date ? new Date(form.date).toISOString() : undefined,
      });
      setForm({ description: '', amount: '', category: '', date: '' });
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Expenses</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Expense</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input className="border rounded p-2" placeholder="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} required />
          <input type="number" step="0.01" className="border rounded p-2" placeholder="Amount (₹)"
            value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <input className="border rounded p-2" placeholder="Category (e.g. Rent, Utilities)"
            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
          <input type="date" className="border rounded p-2" value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })} />
          <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Add Expense
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Expense Records</h2>
          <span className="text-green-600 font-bold">Total: ₹{total.toLocaleString()}</span>
        </div>
        {loading ? <p>Loading...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Description</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{exp.description}</td>
                  <td className="py-2">{exp.category}</td>
                  <td className="py-2">₹{exp.amount.toLocaleString()}</td>
                  <td className="py-2">{new Date(exp.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">No expenses recorded.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}