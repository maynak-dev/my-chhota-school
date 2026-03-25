import { useState, useEffect } from 'react';
import api from '../../services/api';

const Assignments = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    fileUrl: '',
  });

  useEffect(() => {
    const fetchBatches = async () => {
      const res = await api.get('/teachers/me/batches');
      setBatches(res.data);
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      const fetchAssignments = async () => {
        const res = await api.get(`/assignments/batch/${selectedBatch}`);
        setAssignments(res.data);
      };
      fetchAssignments();
    }
  }, [selectedBatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', { ...form, batchId: selectedBatch });
      setForm({ title: '', description: '', dueDate: '', fileUrl: '' });
      const res = await api.get(`/assignments/batch/${selectedBatch}`);
      setAssignments(res.data);
    } catch (err) {
      console.error('Failed to create assignment', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Assignments</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/2"
          >
            <option value="">-- Choose Batch --</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {selectedBatch && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded"
              rows="2"
            />
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="url"
              name="fileUrl"
              placeholder="Assignment File URL (optional)"
              value={form.fileUrl}
              onChange={handleChange}
              className="border p-2 rounded"
            />
            <div className="md:col-span-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Create Assignment
              </button>
            </div>
          </form>
        )}
      </div>

      {selectedBatch && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <h2 className="text-lg font-semibold p-4 border-b">Assignments for {batches.find(b => b.id === selectedBatch)?.name}</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td className="px-6 py-4">{a.title}</td>
                  <td className="px-6 py-4">{a.description}</td>
                  <td className="px-6 py-4">{new Date(a.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {a.fileUrl && <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Assignments;