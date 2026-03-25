import { useState, useEffect } from 'react';
import api from '../../services/api';

const Timetable = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [form, setForm] = useState({
    day: '',
    subject: '',
    startTime: '',
    endTime: '',
    teacherId: '',
  });

  useEffect(() => {
    const fetchBatches = async () => {
      const res = await api.get('/teachers/me/batches');
      setBatches(res.data);
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      const fetchTimetable = async () => {
        const res = await api.get(`/timetable/batch/${selectedBatch}`);
        setTimetable(res.data);
      };
      fetchTimetable();
    }
  }, [selectedBatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/timetable', { ...form, batchId: selectedBatch });
      setForm({ day: '', subject: '', startTime: '', endTime: '', teacherId: '' });
      const res = await api.get(`/timetable/batch/${selectedBatch}`);
      setTimetable(res.data);
    } catch (err) {
      console.error('Failed to add timetable entry', err);
    }
  };

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Timetable</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/2"
          >
            <option value="">-- Choose Batch --</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {selectedBatch && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <select name="day" value={form.day} onChange={handleChange} className="border p-2 rounded" required>
              <option value="">Select Day</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="text" name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} className="border p-2 rounded" required />
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="border p-2 rounded" required />
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="border p-2 rounded" required />
            <div className="md:col-span-3">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Add Entry
              </button>
            </div>
          </form>
        )}
      </div>

      {selectedBatch && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <h2 className="text-lg font-semibold p-4 border-b">Timetable for {batches.find(b => b.id === selectedBatch)?.name}</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4">{entry.day}</td>
                  <td className="px-6 py-4">{entry.subject}</td>
                  <td className="px-6 py-4">{entry.startTime}</td>
                  <td className="px-6 py-4">{entry.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Timetable;