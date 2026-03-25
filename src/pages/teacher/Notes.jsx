import { useState, useEffect } from 'react';
import api from '../../services/api';

const Notes = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({
    title: '',
    fileUrl: '',
    type: 'NOTES',
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
      const fetchNotes = async () => {
        const res = await api.get(`/notes/batch/${selectedBatch}`);
        setNotes(res.data);
      };
      fetchNotes();
    }
  }, [selectedBatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notes', { ...form, batchId: selectedBatch });
      setForm({ title: '', fileUrl: '', type: 'NOTES' });
      // Refresh notes
      const res = await api.get(`/notes/batch/${selectedBatch}`);
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to upload note', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notes & Study Materials</h1>
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <input
              type="url"
              name="fileUrl"
              placeholder="File URL (PDF/Image)"
              value={form.fileUrl}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
              <option value="NOTES">Notes</option>
              <option value="WORKSHEET">Worksheet</option>
              <option value="HOMEWORK">Homework</option>
            </select>
            <div className="md:col-span-3">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Upload Material
              </button>
            </div>
          </form>
        )}
      </div>

      {selectedBatch && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <h2 className="text-lg font-semibold p-4 border-b">Materials for {batches.find(b => b.id === selectedBatch)?.name}</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
              </tr>
            </thead>
            <tbody>
              {notes.map(note => (
                <tr key={note.id}>
                  <td className="px-6 py-4">{note.title}</td>
                  <td className="px-6 py-4">{note.type}</td>
                  <td className="px-6 py-4">{new Date(note.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
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

export default Notes;