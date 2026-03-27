import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, LoadingSpinner } from '../../components/UI';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [feeStatusModal, setFeeStatusModal] = useState(null); // { notification }
  const [statusForm, setStatusForm] = useState({ status: 'PAID' });
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/notifications')
      .then(r => setNotifications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    setUpdatingId(id);
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {} finally { setUpdatingId(null); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const openFeeUpdate = async (notification) => {
    setFeeStatusModal({ notification });
    setStatusForm({ status: 'PAID' });
    setUpdateMsg('');
  };

  const handleFeeStatusUpdate = async () => {
    if (!feeStatusModal?.notification?.studentId) {
      setUpdateMsg('Cannot find student fee records.'); return;
    }
    setUpdating(true); setUpdateMsg('');
    try {
      // Fetch fee records for this student and update the relevant one
      const feesRes = await api.get(`/fees/student/${feeStatusModal.notification.studentId}`);
      const fees = feesRes.data;
      const pendingFees = fees.filter(f => f.status !== 'PAID');
      if (pendingFees.length === 0) {
        setUpdateMsg('No pending fees found for this student.'); setUpdating(false); return;
      }
      // Update the most recent pending fee
      const feeToUpdate = pendingFees[0];
      await api.put(`/fees/${feeToUpdate.id}`, { status: statusForm.status });
      // Mark notification as read
      await api.put(`/notifications/${feeStatusModal.notification.id}/read`);
      setNotifications(prev => prev.map(n => n.id === feeStatusModal.notification.id ? { ...n, isRead: true } : n));
      setUpdateMsg(`Fee status updated to ${statusForm.status} successfully!`);
      setTimeout(() => { setFeeStatusModal(null); setUpdateMsg(''); }, 2500);
    } catch (err) {
      setUpdateMsg(err.response?.data?.error || 'Update failed. Please try again.');
    } finally { setUpdating(false); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />

      <Card>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <CardHeader title="All Notifications" />
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: '#e8f0fe', color: '#1b3f7a' }}
            >
              ✓ Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-10"><LoadingSpinner /></div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-400 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0f4fc' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                className="px-5 py-4 flex gap-4 items-start transition-all"
                style={{ background: n.isRead ? '#fff' : '#f0f7ff' }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: '#e8f0fe' }}>
                  💰
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#1b3f7a' }}>
                        {n.title}
                        {!n.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full align-middle" style={{ background: '#e63946' }} />
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {n.type === 'FEE_PAYMENT' && n.studentId && (
                      <button
                        onClick={() => openFeeUpdate(n)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' }}
                      >
                        ✏️ Update Fee Status
                      </button>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        disabled={updatingId === n.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: '#f0f4fc', color: '#1b3f7a' }}
                      >
                        {updatingId === n.id ? '...' : '✓ Mark Read'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Fee Status Update Modal */}
      {feeStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" style={{ border: '1.5px solid #e8f0fe' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#1b3f7a', fontFamily: 'Baloo 2, cursive' }}>Update Fee Status</h3>
                {feeStatusModal.notification.studentName && (
                  <p className="text-xs text-gray-400 mt-0.5">Student: {feeStatusModal.notification.studentName}</p>
                )}
                {feeStatusModal.notification.amount && (
                  <p className="text-xs text-gray-400">Amount paid: ₹{feeStatusModal.notification.amount?.toLocaleString()}</p>
                )}
              </div>
              <button onClick={() => setFeeStatusModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-all text-lg font-bold">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Set Fee Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['PAID', 'PENDING', 'OVERDUE'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusForm({ status: s })}
                      className="py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: statusForm.status === s
                          ? (s === 'PAID' ? '#2d9e6b' : s === 'OVERDUE' ? '#e63946' : '#1b3f7a')
                          : '#f0f4fc',
                        color: statusForm.status === s ? '#fff' : '#555',
                        border: `1.5px solid ${statusForm.status === s ? 'transparent' : '#e8f0fe'}`,
                      }}
                    >
                      {s === 'PAID' ? '✅' : s === 'PENDING' ? '⏳' : '⚠️'} {s}
                    </button>
                  ))}
                </div>
              </div>

              {updateMsg && (
                <div className="px-3 py-2.5 rounded-xl text-xs font-medium"
                  style={{
                    background: updateMsg.includes('success') ? '#e6f6ef' : '#fff0f1',
                    color: updateMsg.includes('success') ? '#2d9e6b' : '#e63946',
                    border: `1px solid ${updateMsg.includes('success') ? '#b7e9d0' : '#fbc8cb'}`
                  }}>
                  {updateMsg}
                </div>
              )}

              <button
                onClick={handleFeeStatusUpdate}
                disabled={updating}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' }}
              >
                {updating ? 'Updating...' : `Update to ${statusForm.status}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
