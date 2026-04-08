import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ teacherId: '', month: '', year: new Date().getFullYear(), amount: '', deductions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayroll = () => {
    api.get('/payroll').then(res => setPayrolls(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayroll();
    api.get('/teachers').then(res => setTeachers(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount);
    const deductions = parseFloat(form.deductions) || 0;
    try {
      await api.post('/payroll', {
        teacherId: form.teacherId,
        month: parseInt(form.month),
        year: parseInt(form.year),
        amount,
        deductions,
        netAmount: amount - deductions,
      });
      setForm({ teacherId: '', month: '', year: new Date().getFullYear(), amount: '', deductions: 0 });
      fetchPayroll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create payroll entry');
    }
  };

  const markPaid = async (id) => {
    try {
      await api.put(`/payroll/${id}/pay`);
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark as paid');
    }
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payroll Management</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Create Payroll Entry</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <select className="border rounded p-2" value={form.teacherId}
            onChange={e => setForm({ ...form, teacherId: e.target.value })} required>
            <option value="">Select Teacher</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.user?.name} — {t.subject}</option>
            ))}
          </select>
          <select className="border rounded p-2" value={form.month}
            onChange={e => setForm({ ...form, month: e.target.value })} required>
            <option value="">Select Month</option>
            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <input type="number" className="border rounded p-2" placeholder="Year"
            value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required />
          <input type="number" step="0.01" className="border rounded p-2" placeholder="Gross Amount (₹)"
            value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <input type="number" step="0.01" className="border rounded p-2" placeholder="Deductions (₹)"
            value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Create Entry
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Payroll Records</h2>
        {loading ? <p>Loading...</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Teacher</th>
                <th className="pb-2">Month/Year</th>
                <th className="pb-2">Gross</th>
                <th className="pb-2">Deductions</th>
                <th className="pb-2">Net</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{p.teacher?.user?.name}</td>
                  <td className="py-2">{months[p.month - 1]} {p.year}</td>
                  <td className="py-2">₹{p.amount.toLocaleString()}</td>
                  <td className="py-2">₹{p.deductions.toLocaleString()}</td>
                  <td className="py-2 font-semibold">₹{p.netAmount.toLocaleString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${p.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-2">
                    {!p.paid && (
                      <button onClick={() => markPaid(p.id)}
                        className="text-blue-600 hover:underline text-xs">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr><td colSpan={7} className="py-4 text-center text-gray-400">No payroll entries.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}