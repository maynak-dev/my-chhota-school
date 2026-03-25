import { useState, useEffect } from 'react';
import api from '../../services/api';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    courseId: '',
    startDate: '',
    endDate: '',
    teacherId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, coursesRes, teachersRes] = await Promise.all([
        api.get('/batches'),
        api.get('/courses'),
        api.get('/teachers'),
      ]);
      setBatches(batchesRes.data);
      setCourses(coursesRes.data);
      setTeachers(teachersRes.data);
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
      await api.post('/batches', form);
      setForm({ name: '', courseId: '', startDate: '', endDate: '', teacherId: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create batch', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Batches</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Create New Batch</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Batch Name" value={form.name} onChange={handleChange} className="border p-2 rounded" required />
          <select name="courseId" value={form.courseId} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="border p-2 rounded" required />
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="border p-2 rounded" />
          <select name="teacherId" value={form.teacherId} onChange={handleChange} className="border p-2 rounded">
            <option value="">Assign Teacher (optional)</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.user.name} ({t.subject})</option>)}
          </select>
          <div className="md:col-span-2">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="text-lg font-semibold p-4 border-b">Existing Batches</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(b => (
              <tr key={b.id}>
                <td className="px-6 py-4">{b.name}</td>
                <td className="px-6 py-4">{b.course?.name}</td>
                <td className="px-6 py-4">{b.teacher?.user?.name || '-'}</td>
                <td className="px-6 py-4">{new Date(b.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{b.endDate ? new Date(b.endDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Batches;