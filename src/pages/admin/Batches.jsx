import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  PrimaryButton, Table, Td,
} from '../../components/UI';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: '', courseId: '', startDate: '', endDate: '', teacherId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bRes, cRes, tRes] = await Promise.all([
        api.get('/batches'), api.get('/courses'), api.get('/teachers'),
      ]);
      setBatches(bRes.data); setCourses(cRes.data); setTeachers(tRes.data);
    } catch {}
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/batches', form);
      setForm({ name: '', courseId: '', startDate: '', endDate: '', teacherId: '' });
      fetchData();
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Batches" subtitle="Create and manage class batches" />

      <Card>
        <CardHeader title="Create New Batch" />
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={2}>
              <FormInput label="Batch Name" type="text" name="name" placeholder="e.g. Class 5 A" value={form.name} onChange={handleChange} required />
              <FormSelect label="Course" name="courseId" value={form.courseId} onChange={handleChange} required>
                <option value="">Select course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </FormSelect>
              <FormInput label="Start Date" type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
              <FormInput label="End Date (optional)" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
              <div className="md:col-span-2">
                <FormSelect label="Assign Teacher (optional)" name="teacherId" value={form.teacherId} onChange={handleChange}>
                  <option value="">No teacher assigned</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name} — {t.subject}</option>)}
                </FormSelect>
              </div>
            </FormGrid>
            <div className="mt-5">
              <PrimaryButton type="submit" loading={loading}>📚 Create Batch</PrimaryButton>
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader title={`All Batches (${batches.length})`} />

        {/* Desktop */}
        <div className="hidden sm:block">
          <Table headers={['Batch Name', 'Course', 'Teacher', 'Start Date', 'End Date']}>
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-blue-50 transition-colors">
                <Td><span className="font-semibold">{b.name}</span></Td>
                <Td>{b.course?.name || '—'}</Td>
                <Td>{b.teacher?.user?.name || <span className="text-gray-400">Unassigned</span>}</Td>
                <Td>{new Date(b.startDate).toLocaleDateString('en-IN')}</Td>
                <Td>{b.endDate ? new Date(b.endDate).toLocaleDateString('en-IN') : <span className="text-gray-400">—</span>}</Td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Mobile */}
        <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
          {batches.map((b) => (
            <div key={b.id} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#0f2447' }}>{b.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.course?.name} · {b.teacher?.user?.name || 'Unassigned'}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(b.startDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>

        {batches.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No batches created yet.</div>}
      </Card>
    </div>
  );
};

export default Batches;
