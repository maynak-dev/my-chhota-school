import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  PrimaryButton, Table, Td, StatusBadge, LoadingSpinner,
} from '../../components/UI';

const emptyForm = { studentId: '', totalFees: '', dueDate: '' };

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [fetchingPending, setFetchingPending] = useState(false);

  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ totalFees: '', dueDate: '', status: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState('');
  const [editIsError, setEditIsError] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
    fetchPendingPayments();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch fees and students separately
      const [feesRes, studentsRes] = await Promise.all([
        api.get('/fees'),
        api.get('/students')
      ]);
      setFees(feesRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error('Failed to load fee data', err);
    }
  };

  const fetchPendingPayments = async () => {
    setFetchingPending(true);
    try {
      const res = await api.get('/payments?status=PENDING');
      setPendingPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch pending payments', err);
      setPendingPayments([]);
    } finally {
      setFetchingPending(false);
    }
  };

  // Helper to get student name from fee object (since backend may not include full student relation)
  const getStudentName = (fee) => {
    if (fee.student?.user?.name) return fee.student.user.name;
    // Fallback: find student from the separate students list
    const found = students.find(s => s.id === fee.studentId);
    return found?.user?.name || 'N/A';
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.totalFees || !form.dueDate) {
      setMsg('Please fill in all fields.');
      setIsError(true);
      return;
    }
    setLoading(true);
    setMsg('');
    setIsError(false);
    try {
      await api.post('/fees', {
        studentId: form.studentId,
        totalFees: parseFloat(form.totalFees),
        dueDate: form.dueDate,
      });
      setMsg('✅ Fee record created successfully!');
      setIsError(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to create fee record. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (fee) => {
    setEditForm({
      totalFees: fee.totalFees?.toString() || '',
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
      status: fee.status || 'PENDING',
    });
    setEditMsg('');
    setEditIsError(false);
    setEditModal({ fee });
  };

  const handleEditSubmit = async () => {
    if (!editForm.totalFees || !editForm.dueDate || !editForm.status) {
      setEditMsg('Please fill in all fields.');
      setEditIsError(true);
      return;
    }
    setEditLoading(true);
    setEditMsg('');
    setEditIsError(false);
    try {
      await api.put(`/fees/${editModal.fee.id}`, {
        totalFees: parseFloat(editForm.totalFees),
        dueDate: editForm.dueDate,
        status: editForm.status,
      });
      setEditMsg('✅ Fee record updated!');
      setEditIsError(false);
      fetchData();
      setTimeout(() => {
        setEditModal(null);
        setEditMsg('');
      }, 1500);
    } catch (err) {
      setEditMsg(err.response?.data?.error || 'Update failed. Please try again.');
      setEditIsError(true);
    } finally {
      setEditLoading(false);
    }
  };

  const handleApprove = async (payment) => {
    const studentName = payment.fee?.student?.user?.name || 'student';
    if (!window.confirm(`Approve payment of ₹${payment.amount} from ${studentName}?`)) return;
    setActionLoading(payment.id);
    try {
      await api.put(`/payments/${payment.id}`, { status: 'APPROVED' });
      await Promise.all([fetchData(), fetchPendingPayments()]);
    } catch (err) {
      console.error('Approval failed:', err);
      alert(err.response?.data?.error || 'Failed to approve payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (payment) => {
    const studentName = payment.fee?.student?.user?.name || 'student';
    if (!window.confirm(`Reject payment of ₹${payment.amount} from ${studentName}?`)) return;
    setActionLoading(payment.id);
    try {
      await api.put(`/payments/${payment.id}`, { status: 'REJECTED' });
      await fetchPendingPayments();
    } catch (err) {
      console.error('Rejection failed:', err);
      alert(err.response?.data?.error || 'Failed to reject payment');
    } finally {
      setActionLoading(null);
    }
  };

  // Safely compute totals (coerce to numbers)
  const totalCollected = fees.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
  const totalDue = fees.reduce((sum, f) => sum + ((Number(f.totalFees) || 0) - (Number(f.paidAmount) || 0)), 0);

  // Format date safely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Management" subtitle="Track student fees and manage payment approvals" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: fees.length, icon: '📋', color: '#1b3f7a', bg: '#e8f0fe' },
          { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, icon: '✅', color: '#2d9e6b', bg: '#e6f6ef' },
          { label: 'Total Pending (Fees)', value: `₹${totalDue.toLocaleString()}`, icon: '⏳', color: '#e63946', bg: '#fff0f1' },
          { label: 'Pending Approvals', value: pendingPayments.length, icon: '🕒', color: '#f4a261', bg: '#fff3e0' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 flex items-center gap-4"
            style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Payment Approvals Section */}
      <Card>
        <CardHeader title="🕒 Pending Payment Approvals" />
        {fetchingPending ? (
          <div className="py-8"><LoadingSpinner /></div>
        ) : pendingPayments.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No pending payment requests.</div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <Table headers={['Student', 'Fee Type', 'Amount', 'Method', 'Transaction ID', 'Submitted On', 'Actions']}>
                {pendingPayments.map(p => {
                  const studentName = p.fee?.student?.user?.name || 'Unknown';
                  const rollNumber = p.fee?.student?.rollNumber || '';
                  const feeTypeName = p.fee?.feeType?.name || 'Fee Payment';
                  return (
                    <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                      <Td>
                        <span className="font-medium">{studentName}</span>
                        {rollNumber && <><br /><span className="text-xs text-gray-500">Roll: {rollNumber}</span></>}
                      </Td>
                      <Td>{feeTypeName}</Td>
                      <Td className="font-semibold text-amber-700">₹{Number(p.amount).toLocaleString()}</Td>
                      <Td>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#f0f4fc' }}>
                          {p.method === 'ONLINE' ? '🌐 ONLINE' : p.method === 'CASH' ? '💵 CASH' : '💳 CARD'}
                        </span>
                      </Td>
                      <Td className="text-xs font-mono">{p.transactionId || '—'}</Td>
                      <Td className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString('en-IN')}</Td>
                      <Td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(p)}
                            disabled={actionLoading === p.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                          >
                            {actionLoading === p.id ? '...' : '✅ Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(p)}
                            disabled={actionLoading === p.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            ✖ Reject
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </Table>
            </div>

            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {pendingPayments.map(p => {
                const studentName = p.fee?.student?.user?.name || 'Unknown';
                const feeTypeName = p.fee?.feeType?.name || 'Fee Payment';
                return (
                  <div key={p.id} className="px-5 py-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{studentName}</p>
                        <p className="text-xs text-gray-500">{feeTypeName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#f0f4fc' }}>
                        {p.method}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-amber-700">₹{Number(p.amount).toLocaleString()}</p>
                    {p.transactionId && <p className="text-xs text-gray-500">Tx: {p.transactionId}</p>}
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString('en-IN')}</p>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleApprove(p)} disabled={actionLoading === p.id}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-green-100 text-green-700">
                        ✅ Approve
                      </button>
                      <button onClick={() => handleReject(p)} disabled={actionLoading === p.id}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-700">
                        ✖ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Create Fee Record */}
      <Card>
        <CardHeader title="Create Fee Record" />
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={3}>
              <FormSelect label="Student" name="studentId" value={form.studentId} onChange={handleChange} required>
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.user?.name} ({s.rollNumber})</option>
                ))}
              </FormSelect>
              <FormInput label="Total Fees (₹)" type="number" min="1" step="0.01" name="totalFees"
                placeholder="0.00" value={form.totalFees} onChange={handleChange} required />
              <FormInput label="Due Date" type="date" name="dueDate"
                value={form.dueDate} onChange={handleChange} required />
            </FormGrid>
            <div className="mt-5 flex items-center gap-4 flex-wrap">
              <PrimaryButton type="submit" loading={loading}>💰 Create Fee Record</PrimaryButton>
            </div>
            {msg && (
              <div className="mt-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: isError ? '#fff0f1' : '#e6f6ef', color: isError ? '#e63946' : '#2d9e6b', border: `1px solid ${isError ? '#fbc8cb' : '#b7e9d0'}` }}>
                {msg}
              </div>
            )}
          </form>
        </div>
      </Card>

      {/* Fee Records Table */}
      <Card>
        <CardHeader title={`Fee Records (${fees.length})`} />
        <div className="hidden sm:block overflow-x-auto">
          <Table headers={['Student', 'Total Fees', 'Paid', 'Balance', 'Due Date', 'Status', 'Actions']}>
            {fees.map(f => (
              <tr key={f.id} className="hover:bg-blue-50 transition-colors">
                <Td><span className="font-medium">{getStudentName(f)}</span></Td>
                <Td className="font-semibold">₹{Number(f.totalFees).toLocaleString()}</Td>
                <Td className="text-green-600 font-semibold">₹{Number(f.paidAmount).toLocaleString()}</Td>
                <Td className="text-red-500 font-semibold">₹{(Number(f.totalFees) - Number(f.paidAmount)).toLocaleString()}</Td>
                <Td>{formatDate(f.dueDate)}</Td>
                <Td><StatusBadge status={f.status} /></Td>
                <Td>
                  <button onClick={() => openEdit(f)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
                    style={{ background: '#e8f0fe', color: '#1b3f7a' }}>
                    ✏️ Edit
                  </button>
                </Td>
              </tr>
            ))}
          </Table>
        </div>
        <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
          {fees.map(f => (
            <div key={f.id} className="px-5 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{getStudentName(f)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Due: {formatDate(f.dueDate)}</p>
                  <p className="text-xs mt-1">
                    <span className="text-green-600 font-semibold">Paid ₹{Number(f.paidAmount).toLocaleString()}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="font-semibold">₹{Number(f.totalFees).toLocaleString()}</span>
                  </p>
                </div>
                <StatusBadge status={f.status} />
              </div>
              <button onClick={() => openEdit(f)}
                className="mt-1 w-full py-1.5 rounded-lg text-xs font-bold text-center"
                style={{ background: '#e8f0fe', color: '#1b3f7a' }}>
                ✏️ Edit Fee Record
              </button>
            </div>
          ))}
        </div>
        {fees.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No fee records found.</div>}
      </Card>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" style={{ border: '1.5px solid #e8f0fe' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#1b3f7a', fontFamily: 'Baloo 2, cursive' }}>Edit Fee Record</h3>
                <p className="text-xs text-gray-400 mt-0.5">{getStudentName(editModal.fee)}</p>
              </div>
              <button onClick={() => setEditModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-all text-lg font-bold">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Fees (₹)</label>
                <input type="number" min="1" step="0.01" value={editForm.totalFees}
                  onChange={e => setEditForm({ ...editForm, totalFees: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                  style={{ border: '1.5px solid #e8f0fe', background: '#f8faff' }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Due Date</label>
                <input type="date" value={editForm.dueDate}
                  onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #e8f0fe', background: '#f8faff' }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fee Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['PAID', 'PENDING', 'OVERDUE'].map(s => (
                    <button key={s} type="button"
                      onClick={() => setEditForm({ ...editForm, status: s })}
                      className="py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: editForm.status === s
                          ? (s === 'PAID' ? '#2d9e6b' : s === 'OVERDUE' ? '#e63946' : '#1b3f7a')
                          : '#f0f4fc',
                        color: editForm.status === s ? '#fff' : '#555',
                        border: `1.5px solid ${editForm.status === s ? 'transparent' : '#e8f0fe'}`,
                      }}>
                      {s === 'PAID' ? '✅' : s === 'PENDING' ? '⏳' : '⚠️'} {s}
                    </button>
                  ))}
                </div>
              </div>
              {editMsg && (
                <div className="px-3 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: editIsError ? '#fff0f1' : '#e6f6ef', color: editIsError ? '#e63946' : '#2d9e6b', border: `1px solid ${editIsError ? '#fbc8cb' : '#b7e9d0'}` }}>
                  {editMsg}
                </div>
              )}
              <button onClick={handleEditSubmit} disabled={editLoading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' }}>
                {editLoading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;