import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  GreenButton, LoadingSpinner,
} from '../../components/UI';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_COLORS = ['#e8f0fe', '#e6f6ef', '#fff0f1', '#fef3c7', '#f0ebff', '#fce7f3'];
const DAY_TEXT = ['#1b3f7a', '#2d9e6b', '#e63946', '#d97706', '#8b5cf6', '#db2777'];

const AdminTimetable = () => {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [form, setForm] = useState({ day: '', subject: '', startTime: '', endTime: '', teacherId: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/batches'),
      api.get('/teachers'),
    ]).then(([bRes, tRes]) => {
      setBatches(bRes.data);
      setTeachers(tRes.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      setLoading(true);
      api.get(`/timetable/batch/${selectedBatch}`)
        .then(res => setTimetable(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [selectedBatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/timetable/${editId}`, { ...form });
        setEditId(null);
      } else {
        await api.post('/timetable', { ...form, batchId: selectedBatch });
      }
      setForm({ day: '', subject: '', startTime: '', endTime: '', teacherId: '' });
      const res = await api.get(`/timetable/batch/${selectedBatch}`);
      setTimetable(res.data);
    } catch {} finally { setSaving(false); }
  };

  const handleEdit = (entry) => {
    setEditId(entry.id);
    setForm({
      day: entry.day,
      subject: entry.subject,
      startTime: entry.startTime,
      endTime: entry.endTime,
      teacherId: entry.teacherId || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      setTimetable(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = timetable.filter(e => e.day === d);
    return acc;
  }, {});

  const getTeacherName = (t) => t?.user?.name || t?.name || 'Unassigned';

  return (
    <div className="space-y-5">
      <PageHeader title="Timetable Management" subtitle="Create and manage class schedules" />

      <Card>
        <CardHeader title="Select Batch" />
        <div className="p-5 max-w-md">
          <FormSelect value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
            <option value="">— Choose a batch —</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </FormSelect>
        </div>
      </Card>

      {selectedBatch && (
        <>
          <Card>
            <CardHeader title={editId ? '✏️ Edit Period' : '➕ Add Period'} />
            <form onSubmit={handleSubmit} className="p-5">
              <FormGrid cols={2}>
                <FormSelect label="Day" name="day" value={form.day} onChange={handleChange} required>
                  <option value="">Select day</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </FormSelect>
                <FormInput label="Subject" type="text" name="subject" placeholder="e.g. Mathematics" value={form.subject} onChange={handleChange} required />
                <FormInput label="Start Time" type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                <FormInput label="End Time" type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                <FormSelect label="Assign Teacher" name="teacherId" value={form.teacherId} onChange={handleChange}>
                  <option value="">— No teacher —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{getTeacherName(t)}</option>)}
                </FormSelect>
              </FormGrid>
              <div className="mt-5 flex gap-3">
                <GreenButton type="submit" loading={saving}>
                  {editId ? '✏️ Update Period' : '📅 Add to Timetable'}
                </GreenButton>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setForm({ day: '', subject: '', startTime: '', endTime: '', teacherId: '' }); }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#f0f4fc', color: '#666' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </Card>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS.map((day, idx) => (
                <Card key={day}>
                  <div className="px-4 py-3 rounded-t-2xl flex items-center gap-2"
                    style={{ background: DAY_COLORS[idx], borderBottom: `2px solid ${DAY_COLORS[idx]}` }}>
                    <span className="font-bold text-sm" style={{ color: DAY_TEXT[idx] }}>{day}</span>
                    <span className="ml-auto text-xs font-semibold rounded-full px-2 py-0.5"
                      style={{ background: DAY_TEXT[idx], color: '#fff' }}>
                      {grouped[day].length}
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    {grouped[day].length > 0 ? grouped[day].map(entry => (
                      <div key={entry.id} className="flex items-center gap-3 p-2.5 rounded-xl group"
                        style={{ background: '#f8faff' }}>
                        <div className="flex-shrink-0 text-xs font-semibold text-gray-500 text-center w-14">
                          <div>{entry.startTime}</div>
                          <div className="text-gray-300">—</div>
                          <div>{entry.endTime}</div>
                        </div>
                        <div className="w-px h-8 rounded bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm block" style={{ color: '#0f2447' }}>{entry.subject}</span>
                          {entry.teacher && (
                            <span className="text-xs text-gray-400">{getTeacherName(entry.teacher)}</span>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(entry)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                            style={{ background: '#e8f0fe', color: '#1b3f7a' }}>✏️</button>
                          <button onClick={() => handleDelete(entry.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                            style={{ background: '#fff0f1', color: '#e63946' }}>🗑️</button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-xs text-gray-400 py-4">No classes</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminTimetable;