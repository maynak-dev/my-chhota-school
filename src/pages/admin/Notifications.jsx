import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, LoadingSpinner, FormInput, FormTextarea, PrimaryButton } from '../../components/UI';

const ROLE_OPTIONS = [
  { value: '', label: 'All Users (Everyone)' },
  { value: 'SUB_ADMIN', label: 'Teachers / Staff' },
  { value: 'PARENT', label: 'Parents' },
  { value: 'STUDENT', label: 'Students' },
];

const ROLE_BADGES = {
  SUB_ADMIN: { label: 'Teachers', bg: '#e8f0fe', color: '#1b3f7a', emoji: '👩‍🏫' },
  PARENT:    { label: 'Parents',  bg: '#fef3c7', color: '#d97706', emoji: '👨‍👩‍👧' },
  STUDENT:   { label: 'Students', bg: '#e6f6ef', color: '#2d9e6b', emoji: '🎓' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetRole: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [feeStatusModal, setFeeStatusModal] = useState(null);
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      setMsg('Title and message are required.'); setIsError(true); return;
    }
    setSubmitting(true); setMsg(''); setIsError(false);
    try {
      await api.post('/notifications', {
        title: form.title,
        message: form.message,
        targetRole: form.targetRole || null,
      });
      setMsg('Notification sent successfully!');
      setIsError(false);
      setForm({ title: '', message: '', targetRole: '' });
      setShowForm(false);
      fetchNotifications();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to send notification.');
      setIsError(true);
    } finally { setSubmitting(false); }
  };

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

  const openFeeUpdate = (notification) => {
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
      const feesRes = await api.get(`/fees/student/${feeStatusModal.notification.studentId}`);
      const pendingFees = feesRes.data.filter(f => f.status !== 'PAID');
      if (pendingFees.length === 0) {
        setUpdateMsg('No pending fees found for this student.'); setUpdating(false); return;
      }
      await api.put(`/fees/${pendingFees[0].id}`, { status: statusForm.status });
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

  const getIcon = (type) => {
    switch (type) {
      case 'FEE_PAYMENT':  return '💰';
      case 'ANNOUNCEMENT': return '📢';
      default:             return '🔔';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        />
        <button
          onClick={() => { setShowForm(!showForm); setMsg(''); }}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
          style={{
            background: showForm ? '#e63946' : 'linear-gradient(135deg, #1b3f7a, #2d9e6b)',
          }}
        >
          {showForm ? '✕ Cancel' : '+ Send Notification'}
        </button>
      </div>

      {!!msg && (
        <div
          className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{
            background: isError ? '#fff0f1' : '#e6f6ef',
            color: isError ? '#e63946' : '#2d9e6b',
            border: `1px solid ${isError ? '#fcc' : '#b7e9d0'}`,
          }}
        >
          {isError ? '⚠️ ' : '✅ '}{msg}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader title="📢 New Notification" />
          <form onSubmit={handleSend} className="p-5 space-y-4">
            <FormInput
              label="Title *"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Notification title"
              required
            />
            <FormTextarea
              label="Message *"
              value={form.message}
              onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Write your message..."
              rows={4}
              required
            />

            {/* ===== TARGET AUDIENCE SELECTOR ===== */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                🎯 Target Audience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, targetRole: opt.value }))}
                    className="py-3 px-3 rounded-xl text-sm font-bold transition-all text-center"
                    style={{
                      background: form.targetRole === opt.value
                        ? (opt.value === '' ? 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' :
                           ROLE_BADGES[opt.value]?.bg || '#e8f0fe')
                        : '#f5f7fa',
                      color: form.targetRole === opt.value
                        ? (opt.value === '' ? '#fff' : ROLE_BADGES[opt.value]?.color || '#1b3f7a')
                        : '#888',
                      border: `2px solid ${form.targetRole === opt.value ? (opt.value === '' ? '#1b3f7a' : ROLE_BADGES[opt.value]?.color || '#1b3f7a') : '#e5e7eb'}`,
                    }}
                  >
                    {opt.value === '' ? '🌐' : ROLE_BADGES[opt.value]?.emoji} {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {form.targetRole === '' ? 'This notification will be sent to all users.' :
                 `Only ${ROLE_OPTIONS.find(o => o.value === form.targetRole)?.label} will receive this notification.`}
              </p>
            </div>

            <PrimaryButton type="submit" loading={submitting}>
              📢 Send Notification
            </PrimaryButton>
          </form>
        </Card>
      )}

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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: '#e8f0fe' }}>
                  {getIcon(n.type)}
                </div>
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                        {n.targetRole && ROLE_BADGES[n.targetRole] && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: ROLE_BADGES[n.targetRole].bg, color: ROLE_BADGES[n.targetRole].color }}
                          >
                            {ROLE_BADGES[n.targetRole].emoji} {ROLE_BADGES[n.targetRole].label}
                          </span>
                        )}
                        {!n.targetRole && n.type === 'ANNOUNCEMENT' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: '#f0f4fc', color: '#666' }}>
                            🌐 All Users
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
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
                {updating ? 'Updating...' : '✅ Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
