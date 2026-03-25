import { useState, useEffect } from 'react';
import api from '../../services/api';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: '',
    totalFees: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([
        api.get('/fees'),
        api.get('/students'),
      ]);
      setFees(feesRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/fees', form);
      setForm({ studentId: '', totalFees: '', dueDate: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create fee record', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fee Management</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Create Fee Record</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="studentId" value={form.studentId} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Select Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.user.name} ({s.rollNumber})</option>)}
          </select>
          <input type="number" name="totalFees" placeholder="Total Fees" value={form.totalFees} onChange={handleChange} className="border p-2 rounded" required />
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="border p-2 rounded" required />
          <div className="md:col-span-3">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {loading ? 'Creating...' : 'Create Fee Record'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="text-lg font-semibold p-4 border-b">Fee Records</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map(f => (
              <tr key={f.id}>
                <td className="px-6 py-4">{f.student?.user?.name}</td>
                <td className="px-6 py-4">₹{f.totalFees}</td>
                <td className="px-6 py-4">₹{f.paidAmount}</td>
                <td className="px-6 py-4">{new Date(f.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${f.status === 'PAID' ? 'bg-green-100 text-green-800' : f.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeManagement;