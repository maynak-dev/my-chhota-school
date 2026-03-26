import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, Table, Td, LoadingSpinner } from '../../components/UI';

const typeConfig = {
  NOTES: { label: 'Notes', icon: '📝', color: '#1b3f7a', bg: '#e8f0fe' },
  WORKSHEET: { label: 'Worksheet', icon: '📋', color: '#f59e0b', bg: '#fef3c7' },
  HOMEWORK: { label: 'Homework', icon: '🏠', color: '#8b5cf6', bg: '#f0ebff' },
};

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const sRes = await api.get('/students/me');
        const res = await api.get(`/notes/batch/${sRes.data.batchId}`);
        setNotes(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetchNotes();
  }, []);

  const filtered = filter === 'ALL' ? notes : notes.filter((n) => n.type === filter);

  return (
    <div className="space-y-5">
      <PageHeader title="Study Materials" subtitle="Access notes, worksheets, and homework from your teacher" />

      <Card>
        <CardHeader title={`Materials (${filtered.length})`}>
          <div className="flex gap-2">
            {['ALL', 'NOTES', 'WORKSHEET', 'HOMEWORK'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="text-xs font-bold px-3 py-1 rounded-full transition-all"
                style={{
                  background: filter === t ? '#1b3f7a' : '#f0f4fc',
                  color: filter === t ? '#fff' : '#6b7280',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </CardHeader>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block">
              <Table headers={['Title', 'Type', 'Uploaded', 'Action']}>
                {filtered.map((note) => {
                  const tc = typeConfig[note.type] || typeConfig.NOTES;
                  return (
                    <tr key={note.id} className="hover:bg-blue-50 transition-colors">
                      <Td><span className="font-medium">{note.title}</span></Td>
                      <Td><span className="badge" style={{ background: tc.bg, color: tc.color }}>{tc.icon} {tc.label}</span></Td>
                      <Td>{new Date(note.createdAt).toLocaleDateString('en-IN')}</Td>
                      <Td>
                        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-bold hover:underline"
                          style={{ color: '#1b3f7a' }}>
                          ⬇ Download
                        </a>
                      </Td>
                    </tr>
                  );
                })}
              </Table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {filtered.map((note) => {
                const tc = typeConfig[note.type] || typeConfig.NOTES;
                return (
                  <div key={note.id} className="px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: tc.bg }}>{tc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{note.title}</p>
                      <p className="text-xs text-gray-500">{tc.label} · {new Date(note.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg" style={{ background: '#e8f0fe', color: '#1b3f7a' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>
            {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No materials found.</div>}
          </>
        )}
      </Card>
    </div>
  );
};

export default Notes;
