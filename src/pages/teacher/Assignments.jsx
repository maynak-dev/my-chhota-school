import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  FormTextarea, GreenButton, Table, Td,
} from '../../components/UI';

const Assignments = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', fileUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/teachers/me/batches').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      api.get(`/assignments/batch/${selectedBatch}`).then((res) => setAssignments(res.data)).catch(() => {});
    }
  }, [selectedBatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/assignments', { ...form, batchId: selectedBatch });
      setForm({ title: '', description: '', dueDate: '', fileUrl: '' });
      const res = await api.get(`/assignments/batch/${selectedBatch}`);
      setAssignments(res.data);
    } catch {} finally { setLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];
  const batchName = batches.find((b) => b.id === selectedBatch)?.name;

  const isDue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-5">
      <PageHeader title="Assignments" subtitle="Create and manage assignments for your students" />

      <Card>
        <CardHeader title="Select Batch" />
        <div className="p-5 max-w-sm">
          <FormSelect value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            <option value="">— Choose a batch —</option>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </FormSelect>
        </div>
      </Card>

      {selectedBatch && (
        <>
          <Card>
            <CardHeader title={`Create Assignment — ${batchName}`} />
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                <FormGrid cols={2}>
                  <FormInput label="Assignment Title" type="text" name="title" placeholder="e.g. Chapter 4 Exercise" value={form.title} onChange={handleChange} required />
                  <FormInput label="Due Date" type="date" name="dueDate" min={today} value={form.dueDate} onChange={handleChange} required />
                  <div className="md:col-span-2">
                    <FormTextarea label="Description" name="description" placeholder="Describe the assignment..." value={form.description} onChange={handleChange} rows={3} />
                  </div>
                  <div className="md:col-span-2">
                    <FormInput label="Attachment URL (optional)" type="url" name="fileUrl" placeholder="https://..." value={form.fileUrl} onChange={handleChange} />
                  </div>
                </FormGrid>
                <div className="mt-5">
                  <GreenButton type="submit" loading={loading}>📝 Create Assignment</GreenButton>
                </div>
              </form>
            </div>
          </Card>

          <Card>
            <CardHeader title={`Assignments for ${batchName} (${assignments.length})`} />

            {/* Desktop */}
            <div className="hidden sm:block">
              <Table headers={['Title', 'Description', 'Due Date', 'File']}>
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                    <Td><span className="font-semibold">{a.title}</span></Td>
                    <Td><span className="text-gray-500 text-sm">{a.description || '—'}</span></Td>
                    <Td>
                      <span
                        className="badge"
                        style={{
                          background: isDue(a.dueDate) ? '#fff0f1' : '#e6f6ef',
                          color: isDue(a.dueDate) ? '#e63946' : '#2d9e6b',
                        }}
                      >
                        {new Date(a.dueDate).toLocaleDateString('en-IN')}
                      </span>
                    </Td>
                    <Td>
                      {a.fileUrl ? (
                        <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                          style={{ color: '#1b3f7a' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          Attachment
                        </a>
                      ) : <span className="text-gray-400">—</span>}
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {assignments.map((a) => (
                <div key={a.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{a.title}</p>
                      {a.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.description}</p>}
                      {a.fileUrl && (
                        <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold mt-1 inline-block" style={{ color: '#1b3f7a' }}>
                          📎 Attachment
                        </a>
                      )}
                    </div>
                    <span className="badge flex-shrink-0"
                      style={{
                        background: isDue(a.dueDate) ? '#fff0f1' : '#e6f6ef',
                        color: isDue(a.dueDate) ? '#e63946' : '#2d9e6b',
                      }}>
                      {new Date(a.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {assignments.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No assignments created yet.</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Assignments;
