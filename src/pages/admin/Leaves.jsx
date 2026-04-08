import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = () => {
    api.get('/leaves').then(res => setLeaves(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const statusColor = (s) =>
    s === 'APPROVED' ? 'bg-green-100 text-green-700' :
    s === 'REJECTED' ? 'bg-red-100 text-red-700' :
    'bg-yellow-100 text-yellow-700';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leave Requests</h1>
      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-4">Teacher</th>
                <th className="p-4">From</th>
                <th className="p-4">To</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{l.teacher?.user?.name}</td>
                  <td className="p-4">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="p-4 max-w-xs truncate">{l.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${statusColor(l.status)}`}>{l.status}</span>
                  </td>
                  <td className="p-4 space-x-2">
                    {l.status === 'PENDING' && (
                      <>
                        <button onClick={() => updateStatus(l.id, 'APPROVED')}
                          className="text-green-600 hover:underline text-xs">Approve</button>
                        <button onClick={() => updateStatus(l.id, 'REJECTED')}
                          className="text-red-600 hover:underline text-xs">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">No leave requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}