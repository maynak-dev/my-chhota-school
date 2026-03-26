import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect,
  GreenButton, Table, Td,
} from '../../components/UI';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_SHORT = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat' };
const DAY_COLORS = ['#e8f0fe', '#e6f6ef', '#fff0f1', '#fef3c7', '#f0ebff', '#fce7f3'];
const DAY_TEXT = ['#1b3f7a', '#2d9e6b', '#e63946', '#d97706', '#8b5cf6', '#db2777'];

const Timetable = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [form, setForm] = useState({ day: '', subject: '', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/teachers/me/batches').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      api.get(`/timetable/batch/${selectedBatch}`).then((res) => setTimetable(res.data)).catch(() => {});
    }
  }, [selectedBatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/timetable', { ...form, batchId: selectedBatch });
      setForm({ day: '', subject: '', startTime: '', endTime: '' });
      const res = await api.get(`/timetable/batch/${selectedBatch}`);
      setTimetable(res.data);
    } catch {} finally { setLoading(false); }
  };

  const batchName = batches.find((b) => b.id === selectedBatch)?.name;

  // Group by day
  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = timetable.filter((e) => e.day === d);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <PageHeader title="Timetable" subtitle="Manage class schedules for your batches" />

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
            <CardHeader title={`Add Period — ${batchName}`} />
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                <FormGrid cols={2}>
                  <FormSelect label="Day" name="day" value={form.day} onChange={handleChange} required>
                    <option value="">Select day</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </FormSelect>
                  <FormInput label="Subject" type="text" name="subject" placeholder="e.g. Mathematics" value={form.subject} onChange={handleChange} required />
                  <FormInput label="Start Time" type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                  <FormInput label="End Time" type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                </FormGrid>
                <div className="mt-5">
                  <GreenButton type="submit" loading={loading}>📅 Add to Timetable</GreenButton>
                </div>
              </form>
            </div>
          </Card>

          {/* Weekly view */}
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
                  {grouped[day].length > 0 ? grouped[day].map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                      style={{ background: '#f8faff' }}>
                      <div className="flex-shrink-0 text-xs font-semibold text-gray-500 text-center w-14">
                        <div>{entry.startTime}</div>
                        <div className="text-gray-300">—</div>
                        <div>{entry.endTime}</div>
                      </div>
                      <div className="w-px h-8 rounded bg-gray-200 flex-shrink-0" />
                      <span className="font-semibold text-sm" style={{ color: '#0f2447' }}>{entry.subject}</span>
                    </div>
                  )) : (
                    <p className="text-center text-xs text-gray-400 py-4">No classes</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Timetable;
