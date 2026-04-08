import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherDiary() {
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ studentId: '', content: '', type: 'REMARK' });
  const [error, setError] = useState('');

  const fetchEntries = () => {
    api.get('/diary').then(res => setEntries(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchEntries();
    api.get('/students').then(res => setStudents(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/diary', form);
      setForm({ studentId: '', content: '', type: 'REMARK' });
      fetchEntries();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add entry');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Diary</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Entry</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="w-full border rounded p-2" value={form.studentId}
            onChange={e => setForm({ ...form, studentId: e.target.value })} required>
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.user?.name} — {s.rollNumber}</option>
            ))}
          </select>
          <select className="w-full border rounded p-2" value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="REMARK">Remark</option>
            <option value="HOMEWORK">Homework</option>
            <option value="BEHAVIOR">Behavior</option>
          </select>
          <textarea className="w-full border rounded p-2" rows={3} placeholder="Entry content..."
            value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Add Entry
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Diary Entries</h2>
        <ul className="space-y-3">
          {entries.map(e => (
            <li key={e.id} className="border rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{e.student?.user?.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  e.type === 'BEHAVIOR' ? 'bg-red-100 text-red-700' :
                  e.type === 'HOMEWORK' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'}`}>{e.type}</span>
              </div>
              <p className="text-sm text-gray-700">{e.content}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(e.date).toLocaleDateString()}</p>
            </li>
          ))}
          {entries.length === 0 && <p className="text-gray-400 text-center">No diary entries yet.</p>}
        </ul>
      </div>
    </div>
  );
}