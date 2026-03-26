import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  GreenButton, Table, Td,
} from '../../components/UI';

const typeConfig = {
  NOTES: { label: 'Notes', icon: '📝', color: '#1b3f7a', bg: '#e8f0fe' },
  WORKSHEET: { label: 'Worksheet', icon: '📋', color: '#f59e0b', bg: '#fef3c7' },
  HOMEWORK: { label: 'Homework', icon: '🏠', color: '#8b5cf6', bg: '#f0ebff' },
};

const Notes = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', fileUrl: '', type: 'NOTES' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/teachers/me/batches').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      api.get(`/notes/batch/${selectedBatch}`).then((res) => setNotes(res.data)).catch(() => {});
    }
  }, [selectedBatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/notes', { ...form, batchId: selectedBatch });
      setForm({ title: '', fileUrl: '', type: 'NOTES' });
      const res = await api.get(`/notes/batch/${selectedBatch}`);
      setNotes(res.data);
    } catch {} finally { setLoading(false); }
  };

  const batchName = batches.find((b) => b.id === selectedBatch)?.name;

  return (
    <div className="space-y-5">
      <PageHeader title="Notes & Study Materials" subtitle="Upload and manage learning materials for your batches" />

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
            <CardHeader title={`Upload Material — ${batchName}`} />
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                <FormGrid cols={3}>
                  <FormInput label="Title" type="text" name="title" placeholder="e.g. Chapter 3 Notes" value={form.title} onChange={handleChange} required />
                  <FormInput label="File URL (PDF / Image)" type="url" name="fileUrl" placeholder="https://..." value={form.fileUrl} onChange={handleChange} required />
                  <FormSelect label="Type" name="type" value={form.type} onChange={handleChange}>
                    <option value="NOTES">Notes</option>
                    <option value="WORKSHEET">Worksheet</option>
                    <option value="HOMEWORK">Homework</option>
                  </FormSelect>
                </FormGrid>
                <div className="mt-5">
                  <GreenButton type="submit" loading={loading}>📤 Upload Material</GreenButton>
                </div>
              </form>
            </div>
          </Card>

          <Card>
            <CardHeader title={`Materials for ${batchName} (${notes.length})`} />

            {/* Desktop */}
            <div className="hidden sm:block">
              <Table headers={['Title', 'Type', 'Uploaded', 'Link']}>
                {notes.map((note) => {
                  const tc = typeConfig[note.type] || typeConfig.NOTES;
                  return (
                    <tr key={note.id} className="hover:bg-blue-50 transition-colors">
                      <Td><span className="font-medium">{note.title}</span></Td>
                      <Td>
                        <span className="badge" style={{ background: tc.bg, color: tc.color }}>
                          {tc.icon} {tc.label}
                        </span>
                      </Td>
                      <Td>{new Date(note.createdAt).toLocaleDateString('en-IN')}</Td>
                      <Td>
                        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                          style={{ color: '#1b3f7a' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View
                        </a>
                      </Td>
                    </tr>
                  );
                })}
              </Table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {notes.map((note) => {
                const tc = typeConfig[note.type] || typeConfig.NOTES;
                return (
                  <div key={note.id} className="px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: tc.bg }}>
                      {tc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{note.title}</p>
                      <p className="text-xs text-gray-500">{tc.label} · {new Date(note.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg" style={{ background: '#e8f0fe', color: '#1b3f7a' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>

            {notes.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No materials uploaded yet.</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Notes;
