import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  PrimaryButton, Table, Td, StatusBadge,
} from '../../components/UI';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: '', totalFees: '', dueDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([api.get('/fees'), api.get('/students')]);
      setFees(feesRes.data); setStudents(studentsRes.data);
    } catch {}
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/fees', form);
      setForm({ studentId: '', totalFees: '', dueDate: '' });
      fetchData();
    } catch {} finally { setLoading(false); }
  };

  const totalCollected = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalDue = fees.filter(f => f.status !== 'PAID').reduce((sum, f) => sum + (f.totalFees - (f.paidAmount || 0)), 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Management" subtitle="Track and manage student fee records" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Records', value: fees.length, icon: '📋', color: '#1b3f7a', bg: '#e8f0fe' },
          { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, icon: '✅', color: '#2d9e6b', bg: '#e6f6ef' },
          { label: 'Total Pending', value: `₹${totalDue.toLocaleString()}`, icon: '⏳', color: '#e63946', bg: '#fff0f1' },
        ].map((s) => (
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

      <Card>
        <CardHeader title="Create Fee Record" />
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={3}>
              <FormSelect label="Student" name="studentId" value={form.studentId} onChange={handleChange} required>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.user.name} ({s.rollNumber})</option>)}
              </FormSelect>
              <FormInput label="Total Fees (₹)" type="number" name="totalFees" placeholder="0.00" value={form.totalFees} onChange={handleChange} required />
              <FormInput label="Due Date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
            </FormGrid>
            <div className="mt-5">
              <PrimaryButton type="submit" loading={loading}>💰 Create Fee Record</PrimaryButton>
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader title="Fee Records" />

        {/* Desktop */}
        <div className="hidden sm:block">
          <Table headers={['Student', 'Total Fees', 'Paid', 'Balance', 'Due Date', 'Status']}>
            {fees.map((f) => (
              <tr key={f.id} className="hover:bg-blue-50 transition-colors">
                <Td><span className="font-medium">{f.student?.user?.name}</span></Td>
                <Td className="font-semibold">₹{f.totalFees?.toLocaleString()}</Td>
                <Td className="text-green-600 font-semibold">₹{f.paidAmount?.toLocaleString()}</Td>
                <Td className="text-red-500 font-semibold">₹{((f.totalFees || 0) - (f.paidAmount || 0)).toLocaleString()}</Td>
                <Td>{new Date(f.dueDate).toLocaleDateString('en-IN')}</Td>
                <Td><StatusBadge status={f.status} /></Td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Mobile */}
        <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
          {fees.map((f) => (
            <div key={f.id} className="px-5 py-4">
              <div className="flex items-start justify-between">
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
            </div>
          ))}
        </div>

        {fees.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No fee records found.</div>}
      </Card>
    </div>
  );
};

export default FeeManagement;
