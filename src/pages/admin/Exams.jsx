import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({ name: '', date: '', maxMarks: '', batchId: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchExams = () => {
    api.get('/exams').then(res => setExams(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExams();
    api.get('/batches').then(res => setBatches(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/exams', {
        name: form.name,
        date: new Date(form.date).toISOString(),
        maxMarks: parseInt(form.maxMarks),
        batchId: form.batchId,
      });
      setForm({ name: '', date: '', maxMarks: '', batchId: '' });
      fetchExams();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Exam Management</h1>

      {/* Create Exam Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Create Exam</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            className="border rounded p-2"
            placeholder="Exam Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="date"
            className="border rounded p-2"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="Max Marks"
            value={form.maxMarks}
            onChange={e => setForm({ ...form, maxMarks: e.target.value })}
            required
          />
          <select
            className="border rounded p-2"
            value={form.batchId}
            onChange={e => setForm({ ...form, batchId: e.target.value })}
            required
          >
            <option value="">Select Batch</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Exam'}
          </button>
        </form>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">All Exams</h2>
        {loading ? <p>Loading...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Batch</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{exam.name}</td>
                  <td className="py-2">{exam.batch?.name || '—'}</td>
                  <td className="py-2">{new Date(exam.date).toLocaleDateString()}</td>
                  <td className="py-2">{exam.maxMarks}</td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">No exams yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}