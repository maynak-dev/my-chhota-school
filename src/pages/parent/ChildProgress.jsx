import { useState, useEffect } from 'react';
import api from '../../services/api';

const ChildProgress = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
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
      const fetchData = async () => {
        try {
          const [attRes, resRes] = await Promise.all([
            api.get(`/attendance/student/${selectedChild.id}`),
            api.get(`/results/student/${selectedChild.id}`),
          ]);
          setAttendance(attRes.data);
          setResults(resRes.data);
        } catch (err) {
          console.error('Failed to load child data', err);
        }
      };
      fetchData();
    }
  }, [selectedChild]);

  if (loading) return <div>Loading children...</div>;

  if (!children.length) return <div>No children linked to your account.</div>;

  const totalAttendance = attendance.length;
  const present = attendance.filter(a => a.status === 'PRESENT').length;
  const attendancePercentage = totalAttendance ? (present / totalAttendance * 100).toFixed(2) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Child Progress</h1>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-gray-500">Attendance</p>
              <p className="text-2xl font-bold">{attendancePercentage}%</p>
              <p className="text-sm">({present} / {totalAttendance} days)</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-gray-500">Exams Taken</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
            <div className="bg-white p-4 rounded shadow text-center">
              <p className="text-gray-500">Average Score</p>
              <p className="text-2xl font-bold">
                {results.length ? (results.reduce((sum, r) => sum + (r.marksObtained / r.exam.maxMarks * 100), 0) / results.length).toFixed(2) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-x-auto mb-6">
            <h2 className="text-lg font-semibold p-4 border-b">Recent Attendance</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 5).map(record => (
                  <tr key={record.id}>
                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' : record.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded shadow overflow-x-auto">
            <h2 className="text-lg font-semibold p-4 border-b">Exam Results</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr key={result.id}>
                    <td className="px-6 py-4">{result.exam.name}</td>
                    <td className="px-6 py-4">{new Date(result.exam.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{result.marksObtained} / {result.exam.maxMarks}</td>
                    <td className="px-6 py-4">{((result.marksObtained / result.exam.maxMarks) * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ChildProgress;