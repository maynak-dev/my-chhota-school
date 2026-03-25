import { useState, useEffect } from 'react';
import api from '../../services/api';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const studentRes = await api.get('/students/me');
        const batchId = studentRes.data.batchId;
        const res = await api.get(`/notes/batch/${batchId}`);
        setNotes(res.data);
      } catch (err) {
        console.error('Failed to load notes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  if (loading) return <div>Loading notes...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Study Materials</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
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
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notes;