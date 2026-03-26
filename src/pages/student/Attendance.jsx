import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, Table, Td, StatusBadge, LoadingSpinner } from '../../components/UI';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const sRes = await api.get('/students/me');
        const res = await api.get(`/attendance/student/${sRes.data.id}`);
        setAttendance(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetchAttendance();
  }, []);

  const total = attendance.length;
  const present = attendance.filter((a) => a.status === 'PRESENT').length;
  const absent = attendance.filter((a) => a.status === 'ABSENT').length;
  const late = attendance.filter((a) => a.status === 'LATE').length;
  const pct = total ? ((present / total) * 100).toFixed(1) : 0;

  const statCards = [
    { label: 'Total Days', value: total, color: '#1b3f7a', bg: '#e8f0fe' },
    { label: 'Present', value: present, color: '#2d9e6b', bg: '#e6f6ef' },
    { label: 'Absent', value: absent, color: '#e63946', bg: '#fff0f1' },
    { label: 'Late', value: late, color: '#d97706', bg: '#fef3c7' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="My Attendance" subtitle="Track your attendance records" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 text-center"
            style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Percentage bar */}
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm" style={{ color: '#0f2447' }}>Attendance Rate</span>
            <span className="font-bold text-lg" style={{
              fontFamily: 'Baloo 2, cursive',
              color: pct >= 75 ? '#2d9e6b' : pct >= 60 ? '#d97706' : '#e63946'
            }}>{pct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#f0f4fc' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 75 ? 'linear-gradient(90deg, #2d9e6b, #22c55e)' : pct >= 60 ? 'linear-gradient(90deg, #d97706, #fbbf24)' : 'linear-gradient(90deg, #e63946, #f87171)',
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {pct >= 75 ? '✅ Good attendance! Keep it up.' : pct >= 60 ? '⚠️ Attendance is low. Try to improve.' : '❌ Attendance is critically low. Please attend regularly.'}
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Attendance History" />
        {loading ? <LoadingSpinner /> : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block">
              <Table headers={['Date', 'Day', 'Status']}>
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50 transition-colors">
                    <Td>{new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Td>
                    <Td className="text-gray-500">{new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long' })}</Td>
                    <Td><StatusBadge status={record.status} /></Td>
                  </tr>
                ))}
              </Table>
            </div>
            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {attendance.map((record) => (
                <div key={record.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long' })}</p>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
              ))}
            </div>
            {attendance.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No attendance records found.</div>}
          </>
        )}
      </Card>
    </div>
  );
};

export default Attendance;
