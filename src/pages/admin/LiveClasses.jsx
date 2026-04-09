import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, FormInput, FormSelect, FormGrid, Table, Td, StatusBadge, LoadingSpinner } from '../../components/UI';

const LiveClasses = () => {
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', batchId: '', platform: 'ZOOM', meetingUrl: '', scheduledAt: '', duration: 60 });

  useEffect(() => {
    Promise.all([
      api.get('/live-classes/upcoming'),
      api.get('/batches'),
    ]).then(([classRes, batchRes]) => {
      setClasses(classRes.data);
      setBatches(batchRes.data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/live-classes', form);
      setClasses([res.data, ...classes]);
      setShowForm(false);
      setForm({ title: '', description: '', batchId: '', platform: 'ZOOM', meetingUrl: '', scheduledAt: '', duration: 60 });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to schedule');
    }
  };

  const statusColors = {
    SCHEDULED: { bg: '#e0e7ff', color: '#1b3f7a' },
    LIVE: { bg: '#e6f6ef', color: '#2d9e6b' },
    ENDED: { bg: '#f1f5f9', color: '#64748b' },
    CANCELLED: { bg: '#fff0f1', color: '#e63946' },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Live Classes" subtitle="Schedule and manage live sessions" />
        <PrimaryButton onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Schedule Live Class'}
        </PrimaryButton>
      </div>

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={2}>
              <FormInput label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <FormSelect label="Batch" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} required>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </FormSelect>
              <FormSelect label="Platform" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                <option value="ZOOM">Zoom</option>
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="WEBRTC">WebRTC (Built-in)</option>
              </FormSelect>
              <FormInput label="Meeting URL" value={form.meetingUrl} onChange={e => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://zoom.us/j/..." />
              <FormInput label="Scheduled At" type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} required />
              <FormInput label="Duration (min)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} />
            </FormGrid>
            <div className="mt-4">
              <PrimaryButton type="submit">Schedule Class</PrimaryButton>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader title="Upcoming & Recent Classes" />
        <Table headers={['Title', 'Batch', 'Platform', 'Scheduled', 'Duration', 'Status', 'Actions']}>
          {classes.map(c => (
            <tr key={c.id}>
              <Td className="font-semibold">{c.title}</Td>
              <Td>{batches.find(b => b.id === c.batchId)?.name || c.batchId}</Td>
              <Td>
                <span className="badge" style={{ background: '#e0e7ff', color: '#1b3f7a' }}>{c.platform}</span>
              </Td>
              <Td>{new Date(c.scheduledAt).toLocaleString()}</Td>
              <Td>{c.duration} min</Td>
              <Td>
                <span className="badge" style={{ background: statusColors[c.status]?.bg, color: statusColors[c.status]?.color }}>
                  {c.status}
                </span>
              </Td>
              <Td>
                {c.meetingUrl && c.status === 'SCHEDULED' && (
                  <a href={c.meetingUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: '#e6f6ef', color: '#2d9e6b' }}>
                    Join
                  </a>
                )}
                {c.recordingUrl && (
                  <a href={c.recordingUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-bold px-3 py-1.5 rounded-lg ml-2 transition-all"
                    style={{ background: '#e0e7ff', color: '#1b3f7a' }}>
                    Recording
                  </a>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default LiveClasses;
