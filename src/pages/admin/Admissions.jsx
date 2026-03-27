import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  PrimaryButton, Table, Td,
} from '../../components/UI';

const Admissions = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    studentName: '', studentEmail: '', studentPassword: '', studentPhone: '',
    rollNumber: '', batchId: '',
    parentName: '', parentEmail: '', parentPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showParent, setShowParent] = useState(false);

  useEffect(() => {
    api.get('/batches').then(r => setBatches(r.data)).catch(() => {});
    api.get('/students').then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(''); setIsError(false);

    if (showParent && (!form.parentName || !form.parentEmail || !form.parentPassword)) {
      setMessage('Please fill in all parent details (name, email, password).');
      setIsError(true); setLoading(false); return;
    }

    try {
      const payload = {
        studentName: form.studentName,
        studentEmail: form.studentEmail,
        studentPassword: form.studentPassword,
        studentPhone: form.studentPhone,
        rollNumber: form.rollNumber,
        batchId: form.batchId,
        ...(showParent && {
          parentName: form.parentName,
          parentEmail: form.parentEmail,
          parentPassword: form.parentPassword,
        }),
      };
      await api.post('/auth/admit', payload);
      setMessage('Student admitted successfully!' + (showParent ? ' Parent account created.' : ''));
      setIsError(false);
      setForm({ studentName: '', studentEmail: '', studentPassword: '', studentPhone: '', rollNumber: '', batchId: '', parentName: '', parentEmail: '', parentPassword: '' });
      setShowParent(false);
      api.get('/students').then(r => setStudents(r.data)).catch(() => {});
    } catch (err) {
      setMessage(err.response?.data?.error || 'Admission failed');
      setIsError(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Student Admissions" subtitle="Admit new students and manage enrollments" />

      <Card>
        <CardHeader title="Admit New Student" />
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            {/* Student Details */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🎓</span>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1b3f7a' }}>Student Details</p>
              </div>
              <FormGrid cols={2}>
                <FormInput label="Full Name" type="text" name="studentName" placeholder="Enter full name" value={form.studentName} onChange={handleChange} required />
                <FormInput label="Email Address" type="email" name="studentEmail" placeholder="Student login email" value={form.studentEmail} onChange={handleChange} required />
                <FormInput label="Password" type="password" name="studentPassword" placeholder="Set login password" value={form.studentPassword} onChange={handleChange} required />
                <FormInput label="Phone Number" type="tel" name="studentPhone" placeholder="Enter phone" value={form.studentPhone} onChange={handleChange} />
                <FormInput label="Roll Number" type="text" name="rollNumber" placeholder="E.g. STU001" value={form.rollNumber} onChange={handleChange} />
                <FormSelect label="Assign Batch" name="batchId" value={form.batchId} onChange={handleChange} required>
                  <option value="">Select a batch</option>
                  {batches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </FormSelect>
              </FormGrid>
            </div>

            {/* Parent Toggle */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowParent(!showParent)}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                style={{
                  background: showParent ? '#fff0f1' : '#e8f0fe',
                  color: showParent ? '#e63946' : '#1b3f7a',
                  border: `1.5px solid ${showParent ? '#e63946' : '#c5d8f8'}`,
                }}
              >
                {showParent ? '✕ Remove Parent Account' : '+ Add Parent / Guardian Account'}
              </button>
            </div>

            {/* Parent Details */}
            {showParent && (
              <div className="mb-5 p-4 rounded-2xl" style={{ background: '#f8faff', border: '1.5px solid #e8f0fe' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">👨‍👩‍👧</span>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#1b3f7a' }}>Parent / Guardian Details</p>
                </div>
                <p className="text-xs text-gray-400 mb-4 ml-6">
                  Parent will use these credentials to log in and view fees, progress, and timetable.
                </p>
                <FormGrid cols={3}>
                  <FormInput label="Parent Full Name" type="text" name="parentName" placeholder="Enter parent name" value={form.parentName} onChange={handleChange} />
                  <FormInput label="Parent Email" type="email" name="parentEmail" placeholder="Parent login email" value={form.parentEmail} onChange={handleChange} />
                  <FormInput label="Parent Password" type="password" name="parentPassword" placeholder="Set login password" value={form.parentPassword} onChange={handleChange} />
                </FormGrid>
              </div>
            )}

            <div className="mt-5">
              <PrimaryButton type="submit" loading={loading}>🎓 Admit Student</PrimaryButton>
            </div>

            {message && (
              <div className="mt-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: isError ? '#fff0f1' : '#e6f6ef', color: isError ? '#e63946' : '#2d9e6b', border: `1px solid ${isError ? '#fbc8cb' : '#b7e9d0'}` }}>
                {message}
              </div>
            )}
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader title={`Enrolled Students (${students.length})`} />
        <div className="hidden sm:block">
          <Table headers={['Roll No', 'Student', 'Batch', 'Parent']}>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                <Td><span className="font-mono font-semibold text-xs bg-gray-100 px-2 py-1 rounded">{s.rollNumber}</span></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#2d9e6b' }}>
                      {s.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.user?.name}</p>
                      <p className="text-xs text-gray-400">{s.user?.email}</p>
                    </div>
                  </div>
                </Td>
                <Td><span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: '#e8f0fe', color: '#1b3f7a' }}>{s.batch?.name || '—'}</span></Td>
                <Td>
                  {s.parent?.user ? (
                    <div>
                      <p className="text-sm font-medium">{s.parent.user.name}</p>
                      <p className="text-xs text-gray-400">{s.parent.user.email}</p>
                    </div>
                  ) : <span className="text-gray-400 text-sm">—</span>}
                </Td>
              </tr>
            ))}
          </Table>
        </div>
        <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
          {students.map((s) => (
            <div key={s.id} className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: '#2d9e6b' }}>
                  {s.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{s.user?.name}</p>
                  <p className="text-xs text-gray-500">Roll: {s.rollNumber} · {s.batch?.name || 'No batch'}</p>
                  {s.parent?.user && <p className="text-xs text-gray-400 mt-0.5">Parent: {s.parent.user.name} ({s.parent.user.email})</p>}
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
