import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, FormInput, FormSelect, FormTextarea, LoadingSpinner } from '../../components/UI';

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(res => { setCourses(res.data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      api.get(`/discussions/course/${selectedCourse}`).then(res => setDiscussions(res.data));
    }
  }, [selectedCourse]);

  const openThread = async (id) => {
    const res = await api.get(`/discussions/${id}`);
    setSelectedDiscussion(res.data);
  };

  const handleNewDiscussion = async (e) => {
    e.preventDefault();
    const res = await api.post('/discussions', { ...form, courseId: selectedCourse });
    setDiscussions([res.data, ...discussions]);
    setShowNew(false);
    setForm({ title: '', body: '' });
  };

  const handleReply = async (e) => {
    e.preventDefault();
    await api.post(`/discussions/${selectedDiscussion.id}/reply`, { body: replyText });
    setReplyText('');
    openThread(selectedDiscussion.id); // Refresh
  };

  const roleColor = { ADMIN: '#e63946', SUB_ADMIN: '#1b3f7a', STUDENT: '#2d9e6b', PARENT: '#d97706' };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Discussion Forum" subtitle="Course discussions & doubt solving" />
        {selectedCourse && <PrimaryButton onClick={() => { setShowNew(!showNew); setSelectedDiscussion(null); }}>
          {showNew ? '✕ Cancel' : '+ New Discussion'}
        </PrimaryButton>}
      </div>

      <div className="mb-4">
        <FormSelect label="Course" value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedDiscussion(null); }}>
          <option value="">Select Course</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </FormSelect>
      </div>

      {showNew && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleNewDiscussion}>
            <FormInput label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <div className="mt-3">
              <FormTextarea label="Description" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={4} />
            </div>
            <div className="mt-4"><PrimaryButton type="submit">Post Discussion</PrimaryButton></div>
          </form>
        </Card>
      )}

      {selectedDiscussion ? (
        <Card className="p-5">
          <button onClick={() => setSelectedDiscussion(null)} className="text-sm font-bold mb-4" style={{ color: '#1b3f7a' }}>← Back to list</button>
          <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>
            {selectedDiscussion.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${roleColor[selectedDiscussion.userRole]}15`, color: roleColor[selectedDiscussion.userRole] }}>
              {selectedDiscussion.userRole}
            </span>
            <span className="text-xs text-gray-400">{selectedDiscussion.userName} · {new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-700 mb-6 pb-4" style={{ borderBottom: '1px solid #eaf0fb' }}>{selectedDiscussion.body}</p>

          {/* Replies */}
          <div className="space-y-3 mb-6">
            {selectedDiscussion.replies?.map(r => (
              <div key={r.id} className="p-3 rounded-xl" style={{ background: '#f8faff', border: '1px solid #eaf0fb' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: roleColor[r.userRole] }}>{r.userName}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700">{r.body}</p>
                {/* Threaded replies */}
                {r.children?.map(child => (
                  <div key={child.id} className="ml-6 mt-2 p-2 rounded-lg" style={{ background: '#fff', border: '1px solid #f0f4fc' }}>
                    <span className="text-xs font-bold" style={{ color: roleColor[child.userRole] }}>{child.userName}: </span>
                    <span className="text-xs text-gray-600">{child.body}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <form onSubmit={handleReply} className="flex gap-2">
            <input className="form-input flex-1 px-3 py-2.5 border rounded-xl text-sm"
              style={{ borderColor: '#d1d5db' }}
              placeholder="Write a reply..."
              value={replyText} onChange={e => setReplyText(e.target.value)} required />
            <PrimaryButton type="submit">Reply</PrimaryButton>
          </form>
        </Card>
      ) : (
        selectedCourse && (
          <Card>
            <CardHeader title={`Discussions (${discussions.length})`} />
            <div className="divide-y" style={{ borderColor: '#f0f4fc' }}>
              {discussions.map(d => (
                <div key={d.id} className="px-5 py-4 cursor-pointer hover:bg-blue-50/30 transition-all" onClick={() => openThread(d.id)}>
                  <h4 className="font-semibold text-sm" style={{ color: '#0f2447' }}>{d.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: roleColor[d.userRole] }}>{d.userName}</span>
                    <span className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400">{d.replies?.length || 0} replies</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      )}
    </div>
  );
};

export default Discussions;