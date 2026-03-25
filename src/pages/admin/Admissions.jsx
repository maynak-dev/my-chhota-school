import { useState, useEffect } from 'react';
import api from '../../services/api';

const Admissions = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    rollNumber: '',
    batchId: '',
    parentEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/batches');
        setBatches(res.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      }
    };
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        setStudents(res.data);
      } catch (err) {
        console.error('Failed to load students', err);
      }
    };
    fetchBatches();
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // First create user with role STUDENT
      const userRes = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        name: form.name,
        role: 'STUDENT',
        phone: form.phone,
        batchId: form.batchId,
        // optionally create parent if email provided
        ...(form.parentEmail && { parentId: null }), // we'll handle parent separately
      });
      // The user creation should also create the student record
      setMessage('Student admitted successfully!');
      setForm({
        name: '', email: '', password: '', phone: '', rollNumber: '', batchId: '', parentEmail: '',
      });
      // Refresh list
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Admission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Student Admissions</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Admit New Student</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="border p-2 rounded" required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 rounded" required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 rounded" required />
          <input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border p-2 rounded" />
          <input type="text" name="rollNumber" placeholder="Roll Number" value={form.rollNumber} onChange={handleChange} className="border p-2 rounded" required />
          <select name="batchId" value={form.batchId} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="email" name="parentEmail" placeholder="Parent Email (optional)" value={form.parentEmail} onChange={handleChange} className="border p-2 rounded" />
          <div className="md:col-span-2">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {loading ? 'Submitting...' : 'Admit Student'}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="text-lg font-semibold p-4 border-b">Existing Students</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4">{s.rollNumber}</td>
                <td className="px-6 py-4">{s.user?.name}</td>
                <td className="px-6 py-4">{s.batch?.name}</td>
                <td className="px-6 py-4">{s.parent?.user?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admissions;