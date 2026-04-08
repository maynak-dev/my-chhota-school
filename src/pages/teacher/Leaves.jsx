import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [error, setError] = useState('');

  const fetchLeaves = () => {
    api.get('/leaves/my').then(res => setLeaves(res.data)).catch(console.error);
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/leaves', {
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason,
      });
      setForm({ startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply leave');
    }
  };

  const statusColor = (s) =>
    s === 'APPROVED' ? 'bg-green-100 text-green-700' :
    s === 'REJECTED' ? 'bg-red-100 text-red-700' :
    'bg-yellow-100 text-yellow-700';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leave Management</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" className="w-full border rounded p-2" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" className="w-full border rounded p-2" value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <textarea className="w-full border rounded p-2" rows={3} placeholder="Reason for leave..."
            value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Apply Leave
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">My Leave Requests</h2>
        <ul className="space-y-3">
          {leaves.map(l => (
            <li key={l.id} className="border rounded p-4 flex justify-between items-start">
              <div>
                <p className="font-medium">{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600 mt-1">{l.reason}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${statusColor(l.status)}`}>{l.status}</span>
            </li>
          ))}
          {leaves.length === 0 && <p className="text-gray-400 text-center">No leave requests.</p>}
        </ul>
      </div>
    </div>
  );
}