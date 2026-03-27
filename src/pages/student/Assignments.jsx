import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, Table, Td, LoadingSpinner } from '../../components/UI';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const sRes = await api.get('/students/me');
        const res = await api.get(`/assignments/batch/${sRes.data.batchId}`);
        setAssignments(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetchAssignments();
  }, []);

  const isDue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-5">
      <PageHeader title="Assignments" subtitle="View assignments from your teachers" />

      {loading ? (
        <Card><LoadingSpinner /></Card>
      ) : assignments.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-500 font-semibold">No assignments available yet.</p>
            <p className="text-gray-400 text-sm mt-1">Your teacher hasn't posted any assignments yet.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Assignments (${assignments.length})`} />

          {/* Desktop */}
          <div className="hidden sm:block">
            <Table headers={['Title', 'Description', 'Due Date', 'Teacher', 'Attachment']}>
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                  <Td><span className="font-semibold">{a.title}</span></Td>
                  <Td><span className="text-gray-500 text-sm">{a.description || '—'}</span></Td>
                  <Td>
                    <span className="badge" style={{
                      background: isDue(a.dueDate) ? '#fff0f1' : '#e6f6ef',
                      color: isDue(a.dueDate) ? '#e63946' : '#2d9e6b',
                    }}>
                      {new Date(a.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  </Td>
                  <Td>{a.teacher?.user?.name || '—'}</Td>
                  <Td>
                    {a.fileUrl ? (
                      <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-bold hover:underline"
                        style={{ color: '#1b3f7a' }}>
                        ⬇ Download
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
                    <p className="text-xs text-gray-400 mt-1">By: {a.teacher?.user?.name || '—'}</p>
                    {a.fileUrl && (
                      <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold mt-1 inline-block" style={{ color: '#1b3f7a' }}>
                        📎 Download Attachment
                      </a>
                    )}
                  </div>
                  <span className="badge flex-shrink-0" style={{
                    background: isDue(a.dueDate) ? '#fff0f1' : '#e6f6ef',
                    color: isDue(a.dueDate) ? '#e63946' : '#2d9e6b',
                  }}>
                    {new Date(a.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Assignments;
