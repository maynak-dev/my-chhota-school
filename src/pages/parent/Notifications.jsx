import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/my')
      .then(res => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {loading && <p>Loading...</p>}
      {!loading && notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet.</p>
      )}
      <ul className="space-y-3">
        {notifications.map(n => (
          <li key={n.id} className="bg-white rounded-xl shadow p-4">
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-gray-600">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}