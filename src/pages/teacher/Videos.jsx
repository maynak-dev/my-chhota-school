import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  GreenButton, Table, Td,
} from '../../components/UI';

const Videos = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: '', url: '', duration: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/teachers/me/batches').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      api.get(`/videos/batch/${selectedBatch}`).then((res) => setVideos(res.data)).catch(() => {});
    }
  }, [selectedBatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/videos', {
        ...form,
        batchId: selectedBatch,
        duration: form.duration ? parseInt(form.duration) : undefined,
      });
      setForm({ title: '', url: '', duration: '' });
      const res = await api.get(`/videos/batch/${selectedBatch}`);
      setVideos(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.delete(`/videos/${id}`);
      setVideos(videos.filter((v) => v.id !== id));
    } catch {}
  };

  const formatDuration = (secs) => {
    if (!secs) return '—';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')} min`;
  };

  const batchName = batches.find((b) => b.id === selectedBatch)?.name;

  return (
    <div className="space-y-5">
      <PageHeader title="Video Lectures" subtitle="Upload and manage video lectures for your batches" />

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
            <CardHeader title={`Upload Video — ${batchName}`} />
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                <FormGrid cols={3}>
                  <FormInput label="Video Title" type="text" name="title" placeholder="e.g. Chapter 3 Lecture" value={form.title} onChange={handleChange} required />
                  <FormInput label="Video URL (YouTube/Drive/etc)" type="url" name="url" placeholder="https://..." value={form.url} onChange={handleChange} required />
                  <FormInput label="Duration (seconds, optional)" type="number" name="duration" placeholder="e.g. 1800" value={form.duration} onChange={handleChange} />
                </FormGrid>
                <div className="mt-5">
                  <GreenButton type="submit" loading={loading}>🎬 Upload Video</GreenButton>
                </div>
              </form>
            </div>
          </Card>

          <Card>
            <CardHeader title={`Videos for ${batchName} (${videos.length})`} />

            {/* Desktop */}
            <div className="hidden sm:block">
              <Table headers={['Title', 'Duration', 'Uploaded', 'Link', 'Action']}>
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-blue-50 transition-colors">
                    <Td><span className="font-medium">{video.title}</span></Td>
                    <Td>{formatDuration(video.duration)}</Td>
                    <Td>{new Date(video.createdAt).toLocaleDateString('en-IN')}</Td>
                    <Td>
                      <a href={video.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                        style={{ color: '#1b3f7a' }}>
                        ▶ Watch
                      </a>
                    </Td>
                    <Td>
                      <button onClick={() => handleDelete(video.id)}
                        className="text-xs font-bold px-3 py-1 rounded-lg transition-all hover:opacity-80"
                        style={{ background: '#fff0f1', color: '#e63946' }}>
                        🗑 Delete
                      </button>
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {videos.map((video) => (
                <div key={video.id} className="px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#e8f0fe' }}>
                    🎬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{video.title}</p>
                    <p className="text-xs text-gray-500">{formatDuration(video.duration)} · {new Date(video.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <a href={video.url} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 rounded-lg" style={{ background: '#e8f0fe', color: '#1b3f7a' }}>
                    ▶
                  </a>
                  <button onClick={() => handleDelete(video.id)}
                    className="flex-shrink-0 p-2 rounded-lg" style={{ background: '#fff0f1', color: '#e63946' }}>
                    🗑
                  </button>
                </div>
              ))}
            </div>

            {videos.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No videos uploaded yet.</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Videos;
