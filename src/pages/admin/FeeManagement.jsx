import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  PrimaryButton, Table, Td, StatusBadge,
} from '../../components/UI';

const emptyForm = { studentId: '', totalFees: '', dueDate: '' };

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  // Edit modal state
  const [editModal, setEditModal] = useState(null); // { fee }
  const [editForm, setEditForm] = useState({ totalFees: '', dueDate: '', status: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState('');
  const [editIsError, setEditIsError] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([api.get('/fees'), api.get('/students')]);
      setFees(feesRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error('Failed to load fee data', err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.totalFees || !form.dueDate) {
      setMsg('Please fill in all fields.'); setIsError(true); return;
    }
    setLoading(true); setMsg(''); setIsError(false);
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
    } finally { setLoading(false); }
  };

  const openEdit = (fee) => {
    setEditForm({
      totalFees: fee.totalFees?.toString() || '',
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
      status: fee.status || 'PENDING',
    });
    setEditMsg(''); setEditIsError(false);
    setEditModal({ fee });
  };

  const handleEditSubmit = async () => {
    if (!editForm.totalFees || !editForm.dueDate || !editForm.status) {
      setEditMsg('Please fill in all fields.'); setEditIsError(true); return;
    }
    setEditLoading(true); setEditMsg(''); setEditIsError(false);
    try {
      await api.put(`/fees/${editModal.fee.id}`, {
        totalFees: parseFloat(editForm.totalFees),
        dueDate: editForm.dueDate,
        status: editForm.status,
      });
      setEditMsg('✅ Fee record updated!');
      setEditIsError(false);
      fetchData();
      setTimeout(() => { setEditModal(null); setEditMsg(''); }, 1500);
    } catch (err) {
      setEditMsg(err.response?.data?.error || 'Update failed. Please try again.');
      setEditIsError(true);
    } finally { setEditLoading(false); }
  };

  const totalCollected = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalDue = fees.filter(f => f.status !== 'PAID').reduce((sum, f) => sum + ((f.totalFees || 0) - (f.paidAmount || 0)), 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Management" subtitle="Track and manage student fee records" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Records', value: fees.length, icon: '📋', color: '#1b3f7a', bg: '#e8f0fe' },
          { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, icon: '✅', color: '#2d9e6b', bg: '#e6f6ef' },
          { label: 'Total Pending', value: `₹${totalDue.toLocaleString()}`, icon: '⏳', color: '#e63946', bg: '#fff0f1' },
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

        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <Table headers={['Student', 'Total Fees', 'Paid', 'Balance', 'Due Date', 'Status', 'Actions']}>
            {fees.map(f => (
              <tr key={f.id} className="hover:bg-blue-50 transition-colors">
                <Td><span className="font-medium">{f.student?.user?.name}</span></Td>
                <Td className="font-semibold">₹{f.totalFees?.toLocaleString()}</Td>
                <Td className="text-green-600 font-semibold">₹{f.paidAmount?.toLocaleString()}</Td>
                <Td className="text-red-500 font-semibold">₹{((f.totalFees || 0) - (f.paidAmount || 0)).toLocaleString()}</Td>
                <Td>{new Date(f.dueDate).toLocaleDateString('en-IN')}</Td>
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

        {/* Mobile */}
        <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
          {fees.map(f => (
            <div key={f.id} className="px-5 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{f.student?.user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Due: {new Date(f.dueDate).toLocaleDateString('en-IN')}</p>
                  <p className="text-xs mt-1">
                    <span className="text-green-600 font-semibold">Paid ₹{f.paidAmount?.toLocaleString()}</span>
                    <span className="text-gray-400"> / </span>
                    <span className="font-semibold">₹{f.totalFees?.toLocaleString()}</span>
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
                <p className="text-xs text-gray-400 mt-0.5">{editModal.fee.student?.user?.name}</p>
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
