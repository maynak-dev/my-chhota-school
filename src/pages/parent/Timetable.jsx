import { useState, useEffect } from 'react';
import api from '../../services/api';

const Timetable = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const parentRes = await api.get('/parents/me');
        setChildren(parentRes.data.children);
        if (parentRes.data.children.length > 0) {
          setSelectedChild(parentRes.data.children[0]);
        }
      } catch (err) {
        console.error('Failed to load children', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      const fetchTimetable = async () => {
        try {
          const res = await api.get(`/timetable/batch/${selectedChild.batchId}`);
          setTimetable(res.data);
        } catch (err) {
          console.error('Failed to load timetable', err);
        }
      };
      fetchTimetable();
    }
  }, [selectedChild]);

  if (loading) return <div>Loading...</div>;

  if (!children.length) return <div>No children linked to your account.</div>;

  const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const grouped = {};
  timetable.forEach(entry => {
    if (!grouped[entry.day]) grouped[entry.day] = [];
    grouped[entry.day].push(entry);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Class Timetable</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <label className="block text-gray-700 mb-2">Select Child</label>
        <select
          value={selectedChild?.id || ''}
          onChange={(e) => setSelectedChild(children.find(c => c.id === e.target.value))}
          className="border p-2 rounded w-full md:w-1/2"
        >
          {children.map(child => (
            <option key={child.id} value={child.id}>{child.user.name} (Roll: {child.rollNumber})</option>
          ))}
        </select>
      </div>

      {selectedChild && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {daysOrder.map(day => {
                const entries = grouped[day] || [];
                if (entries.length === 0) {
                  return (
                    <tr key={day}>
                      <td className="px-6 py-4 font-medium">{day}</td>
                      <td colSpan="3" className="px-6 py-4 text-gray-500">No classes</td>
                    </tr>
                  );
                }
                return entries.map((entry, idx) => (
                  <tr key={`${day}-${idx}`}>
                    {idx === 0 && <td className="px-6 py-4 font-medium" rowSpan={entries.length}>{day}</td>}
                    <td className="px-6 py-4">{entry.subject}</td>
                    <td className="px-6 py-4">{entry.startTime} - {entry.endTime}</td>
                    <td className="px-6 py-4">{entry.teacher?.user?.name || '-'}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Timetable;