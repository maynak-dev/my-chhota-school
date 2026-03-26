import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormSelect, Table, Td, StatusBadge, LoadingSpinner } from '../../components/UI';

const gradeColor = (pct) => {
  if (pct >= 90) return { color: '#2d9e6b', bg: '#e6f6ef', grade: 'A+' };
  if (pct >= 75) return { color: '#1b3f7a', bg: '#e8f0fe', grade: 'A' };
  if (pct >= 60) return { color: '#d97706', bg: '#fef3c7', grade: 'B' };
  return { color: '#e63946', bg: '#fff0f1', grade: 'C' };
};

const ChildProgress = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/parents/me');
        setChildren(res.data.children || []);
        if (res.data.children?.length > 0) setSelectedChild(res.data.children[0]);
      } catch {} finally { setLoading(false); }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      const fetchData = async () => {
        setDataLoading(true);
        try {
          const [aRes, rRes] = await Promise.all([
            api.get(`/attendance/student/${selectedChild.id}`),
            api.get(`/results/student/${selectedChild.id}`),
          ]);
          setAttendance(aRes.data); setResults(rRes.data);
        } catch {} finally { setDataLoading(false); }
      };
      fetchData();
    }
  }, [selectedChild]);

  if (loading) return <Card><LoadingSpinner /></Card>;
  if (!children.length) return (
    <div className="space-y-5">
      <PageHeader title="Child Progress" />
      <Card>
        <div className="py-12 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <p className="text-gray-500">No children linked to your account.</p>
        </div>
      </Card>
    </div>
  );

  const total = attendance.length;
  const present = attendance.filter((a) => a.status === 'PRESENT').length;
  const pct = total ? ((present / total) * 100).toFixed(1) : 0;
  const avgScore = results.length
    ? (results.reduce((s, r) => s + (r.marksObtained / r.exam.maxMarks) * 100, 0) / results.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Child Progress" subtitle="Monitor your child's academic performance" />

      <Card>
        <CardHeader title="Select Child" />
        <div className="p-5 max-w-sm">
          <FormSelect
            value={selectedChild?.id || ''}
            onChange={(e) => setSelectedChild(children.find((c) => c.id === e.target.value))}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.user?.name} (Roll: {c.rollNumber})</option>
            ))}
          </FormSelect>
        </div>
      </Card>

      {selectedChild && (
        <>
          {/* Child info card */}
          <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #0f2447, #1b3f7a)', boxShadow: '0 4px 20px rgba(15,36,71,0.25)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              style={{ background: '#2d9e6b' }}>
              {selectedChild.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-base" style={{ fontFamily: 'Baloo 2, cursive' }}>
                {selectedChild.user?.name}
              </p>
              <p className="text-blue-200 text-sm">Roll: {selectedChild.rollNumber} · {selectedChild.batch?.name || 'No batch'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Attendance', value: `${pct}%`, color: pct >= 75 ? '#2d9e6b' : '#e63946', bg: pct >= 75 ? '#e6f6ef' : '#fff0f1', icon: '📅' },
              { label: 'Exams', value: results.length, color: '#1b3f7a', bg: '#e8f0fe', icon: '📝' },
              { label: 'Avg Score', value: `${avgScore}%`, color: '#d97706', bg: '#fef3c7', icon: '⭐' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <p className="text-xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>

          {dataLoading ? <Card><LoadingSpinner /></Card> : (
            <>
              <Card>
                <CardHeader title="Recent Attendance" />
                {/* Desktop */}
                <div className="hidden sm:block">
                  <Table headers={['Date', 'Status']}>
                    {attendance.slice(0, 7).map((a) => (
                      <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                        <Td>{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Td>
                        <Td><StatusBadge status={a.status} /></Td>
                      </tr>
                    ))}
                  </Table>
                </div>
                {/* Mobile */}
                <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
                  {attendance.slice(0, 7).map((a) => (
                    <div key={a.id} className="px-5 py-3.5 flex items-center justify-between">
                      <span className="text-sm">{new Date(a.date).toLocaleDateString('en-IN')}</span>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
                {attendance.length === 0 && <div className="py-8 text-center text-gray-400 text-sm">No records yet.</div>}
              </Card>

              <Card>
                <CardHeader title="Exam Results" />
                {/* Desktop */}
                <div className="hidden sm:block">
                  <Table headers={['Exam', 'Date', 'Marks', 'Grade']}>
                    {results.map((r) => {
                      const p = ((r.marksObtained / r.exam.maxMarks) * 100);
                      const g = gradeColor(p);
                      return (
                        <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                          <Td><span className="font-semibold">{r.exam.name}</span></Td>
                          <Td>{new Date(r.exam.date).toLocaleDateString('en-IN')}</Td>
                          <Td><span className="font-bold">{r.marksObtained}</span><span className="text-gray-400"> / {r.exam.maxMarks}</span></Td>
                          <Td><span className="badge" style={{ background: g.bg, color: g.color }}>{g.grade} — {p.toFixed(0)}%</span></Td>
                        </tr>
                      );
                    })}
                  </Table>
                </div>
                {/* Mobile */}
                <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
                  {results.map((r) => {
                    const p = ((r.marksObtained / r.exam.maxMarks) * 100);
                    const g = gradeColor(p);
                    return (
                      <div key={r.id} className="px-5 py-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{r.exam.name}</p>
                          <p className="text-xs text-gray-500">{r.marksObtained}/{r.exam.maxMarks}</p>
                        </div>
                        <span className="badge" style={{ background: g.bg, color: g.color }}>{g.grade}</span>
                      </div>
                    );
                  })}
                </div>
                {results.length === 0 && <div className="py-8 text-center text-gray-400 text-sm">No results yet.</div>}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChildProgress;
