import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  PrimaryButton, Table, Td, SuccessMessage,
} from '../../components/UI';

const Admissions = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', rollNumber: '', batchId: '', parentEmail: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try { const res = await api.get('/batches'); setBatches(res.data); } catch {}
    };
    const fetchStudents = async () => {
      try { const res = await api.get('/students'); setStudents(res.data); } catch {}
    };
    fetchBatches(); fetchStudents();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      await api.post('/auth/register', {
        email: form.email, password: form.password, name: form.name,
        role: 'STUDENT', phone: form.phone, batchId: form.batchId,
        ...(form.parentEmail && { parentId: null }),
      });
      setMessage('Student admitted successfully!');
      setForm({ name: '', email: '', password: '', phone: '', rollNumber: '', batchId: '', parentEmail: '' });
      const res = await api.get('/students'); setStudents(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Admission failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Student Admissions" subtitle="Admit new students and manage enrollments" />

      <Card>
        <CardHeader title="Admit New Student" />
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={2}>
              <FormInput label="Full Name" type="text" name="name" placeholder="Enter full name" value={form.name} onChange={handleChange} required />
              <FormInput label="Email Address" type="email" name="email" placeholder="Enter email" value={form.email} onChange={handleChange} required />
              <FormInput label="Password" type="password" name="password" placeholder="Set password" value={form.password} onChange={handleChange} required />
              <FormInput label="Phone Number" type="tel" name="phone" placeholder="Enter phone" value={form.phone} onChange={handleChange} />
              <FormInput label="Roll Number" type="text" name="rollNumber" placeholder="Enter roll number" value={form.rollNumber} onChange={handleChange} required />
              <FormSelect label="Assign Batch" name="batchId" value={form.batchId} onChange={handleChange} required>
                <option value="">Select a batch</option>
                {batches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </FormSelect>
              <div className="md:col-span-2">
                <FormInput label="Parent Email (optional)" type="email" name="parentEmail" placeholder="Enter parent email" value={form.parentEmail} onChange={handleChange} />
              </div>
            </FormGrid>
            <div className="mt-5">
              <PrimaryButton type="submit" loading={loading}>
                🎓 Admit Student
              </PrimaryButton>
            </div>
            <SuccessMessage msg={message} />
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader title={`Enrolled Students (${students.length})`} />

        {/* Desktop */}
        <div className="hidden sm:block">
          <Table headers={['Roll No', 'Name', 'Batch', 'Parent']}>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                <Td><span className="font-mono font-semibold text-xs bg-gray-100 px-2 py-1 rounded">{s.rollNumber}</span></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: '#2d9e6b' }}>{s.user?.name?.[0]?.toUpperCase()}</div>
                    {s.user?.name}
                  </div>
                </Td>
                <Td><span className="badge" style={{ background: '#e8f0fe', color: '#1b3f7a' }}>{s.batch?.name || '—'}</span></Td>
                <Td>{s.parent?.user?.name || <span className="text-gray-400">—</span>}</Td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Mobile */}
        <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
          {students.map((s) => (
            <div key={s.id} className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: '#2d9e6b' }}>{s.user?.name?.[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{s.user?.name}</p>
                  <p className="text-xs text-gray-500">Roll: {s.rollNumber} · {s.batch?.name || 'No batch'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No students admitted yet.</div>}
      </Card>
    </div>
  );
};

export default Admissions;
