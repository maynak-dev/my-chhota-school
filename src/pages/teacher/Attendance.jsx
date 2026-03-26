import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormSelect, PrimaryButton, StatusBadge } from '../../components/UI';

const Attendance = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try { const res = await api.get('/teachers/me/batches'); setBatches(res.data); } catch {}
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      const fetchStudents = async () => {
        try {
          const res = await api.get(`/batches/${selectedBatch}/students`);
          setStudents(res.data);
          const init = {}; res.data.forEach((s) => (init[s.id] = 'PRESENT'));
          setAttendance(init);
        } catch {}
      };
      fetchStudents();
    } else { setStudents([]); }
  }, [selectedBatch]);

  const handleAttendanceChange = (id, status) => setAttendance((prev) => ({ ...prev, [id]: status }));

  const handleSubmit = async () => {
    setSaving(true); setSaved(false);
    try {
      const teacherRes = await api.get('/teachers/me');
      const teacherId = teacherRes.data.id;
      const entries = Object.entries(attendance).map(([studentId, status]) => ({
        studentId, status, date: new Date().toISOString(), markedBy: teacherId,
      }));
      await api.post('/attendance/bulk', { entries });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
  Object.values(attendance).forEach((s) => { if (counts[s] !== undefined) counts[s]++; });

  const statusColors = { PRESENT: '#e6f6ef', ABSENT: '#fff0f1', LATE: '#fef3c7' };
  const statusTextColors = { PRESENT: '#2d9e6b', ABSENT: '#e63946', LATE: '#d97706' };

  return (
    <div className="space-y-5">
      <PageHeader title="Mark Attendance" subtitle={`Today: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} />

      <Card>
        <CardHeader title="Select Batch" />
        <div className="p-5">
          <div className="max-w-sm">
            <FormSelect label="Batch" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
              <option value="">— Choose a batch —</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </FormSelect>
          </div>
        </div>
      </Card>

      {students.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(counts).map(([status, count]) => (
              <div key={status} className="bg-white rounded-2xl p-4 text-center"
                style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)', background: statusColors[status] }}>
                <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: statusTextColors[status] }}>{count}</p>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: statusTextColors[status] }}>{status}</p>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader title={`Students — ${batches.find((b) => b.id === selectedBatch)?.name}`}>
              <span className="text-sm text-gray-400">{students.length} students</span>
            </CardHeader>

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ background: '#f8faff' }}>
                    {['Student', 'Roll No', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500"
                        style={{ borderBottom: '2px solid #eaf0fb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#f0f4fc' }}>
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: '#1b3f7a' }}>{s.user.name?.[0]?.toUpperCase()}</div>
                          <span className="font-medium text-sm">{s.user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{s.rollNumber}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          {['PRESENT', 'ABSENT', 'LATE'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleAttendanceChange(s.id, status)}
                              className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                              style={{
                                background: attendance[s.id] === status ? statusColors[status] : '#f1f5f9',
                                color: attendance[s.id] === status ? statusTextColors[status] : '#94a3b8',
                                border: attendance[s.id] === status ? `1.5px solid ${statusTextColors[status]}` : '1.5px solid transparent',
                              }}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {students.map((s) => (
                <div key={s.id} className="px-4 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: '#1b3f7a' }}>{s.user.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="font-semibold text-sm">{s.user.name}</p>
                      <p className="text-xs text-gray-500">Roll: {s.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['PRESENT', 'ABSENT', 'LATE'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendanceChange(s.id, status)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: attendance[s.id] === status ? statusColors[status] : '#f1f5f9',
                          color: attendance[s.id] === status ? statusTextColors[status] : '#94a3b8',
                          border: attendance[s.id] === status ? `1.5px solid ${statusTextColors[status]}` : '1.5px solid transparent',
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t" style={{ borderColor: '#eaf0fb' }}>
              {saved && (
                <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Attendance saved successfully!
                </div>
              )}
              <PrimaryButton onClick={handleSubmit} loading={saving}>
                ✅ Save Attendance
              </PrimaryButton>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Attendance;
