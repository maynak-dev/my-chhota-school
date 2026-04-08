import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function StudentDiary() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/diary/my').then(res => setEntries(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Diary</h1>
      {loading ? <p>Loading...</p> : entries.length === 0 ? (
        <p className="text-gray-500">No diary entries yet.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(e => (
            <li key={e.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  e.type === 'BEHAVIOR' ? 'bg-red-100 text-red-700' :
                  e.type === 'HOMEWORK' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'}`}>{e.type}</span>
                <span className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm mt-2">{e.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}