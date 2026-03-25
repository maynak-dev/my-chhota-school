import { useState, useEffect } from 'react';
import api from '../../services/api';

const Attendance = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get('/teachers/me/batches');
        setBatches(res.data);
      } catch (err) {
        console.error('Failed to load batches', err);
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      const fetchStudents = async () => {
        try {
          const res = await api.get(`/batches/${selectedBatch}/students`);
          setStudents(res.data);
          const initial = {};
          res.data.forEach(s => (initial[s.id] = 'PRESENT'));
          setAttendance(initial);
        } catch (err) {
          console.error('Failed to load students', err);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedBatch]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Get teacher ID (from user object in context)
      const teacherRes = await api.get('/teachers/me');
      const teacherId = teacherRes.data.id;

      const entries = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
        date: new Date().toISOString(),
        markedBy: teacherId,
      }));

      await api.post('/attendance/bulk', { entries });
      alert('Attendance saved successfully');
    } catch (err) {
      console.error('Failed to save attendance', err);
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>
      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/2"
          >
            <option value="">-- Choose Batch --</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {students.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Students</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{student.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.rollNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={attendance[student.id]}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          className="border p-1 rounded"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;