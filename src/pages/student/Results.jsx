import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, Table, Td, LoadingSpinner } from '../../components/UI';

const gradeColor = (pct) => {
  if (pct >= 90) return { color: '#2d9e6b', bg: '#e6f6ef', grade: 'A+' };
  if (pct >= 75) return { color: '#1b3f7a', bg: '#e8f0fe', grade: 'A' };
  if (pct >= 60) return { color: '#d97706', bg: '#fef3c7', grade: 'B' };
  if (pct >= 45) return { color: '#f59e0b', bg: '#fef9c3', grade: 'C' };
  return { color: '#e63946', bg: '#fff0f1', grade: 'D' };
};

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const sRes = await api.get('/students/me');
        const res = await api.get(`/results/student/${sRes.data.id}`);
        setResults(res.data);
      } catch {} finally { setLoading(false); }
    };
    fetchResults();
  }, []);

  const avgPct = results.length
    ? (results.reduce((s, r) => s + (r.marksObtained / r.exam.maxMarks) * 100, 0) / results.length).toFixed(1)
    : 0;
  const best = results.length
    ? Math.max(...results.map((r) => ((r.marksObtained / r.exam.maxMarks) * 100))).toFixed(1)
    : 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Exam Results" subtitle="View your academic performance" />

      {/* Summary cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: '#1b3f7a' }}>{results.length}</p>
            <p className="text-xs text-gray-500 font-semibold">Exams Taken</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: '#2d9e6b' }}>{avgPct}%</p>
            <p className="text-xs text-gray-500 font-semibold">Average Score</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: '#f59e0b' }}>{best}%</p>
            <p className="text-xs text-gray-500 font-semibold">Best Score</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader title="All Results" />
        {loading ? <LoadingSpinner /> : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block">
              <Table headers={['Exam', 'Date', 'Marks', 'Percentage', 'Grade', 'Feedback']}>
                {results.map((r) => {
                  const pct = ((r.marksObtained / r.exam.maxMarks) * 100);
                  const g = gradeColor(pct);
                  return (
                    <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                      <Td><span className="font-semibold">{r.exam.name}</span></Td>
                      <Td>{new Date(r.exam.date).toLocaleDateString('en-IN')}</Td>
                      <Td>
                        <span className="font-bold">{r.marksObtained}</span>
                        <span className="text-gray-400"> / {r.exam.maxMarks}</span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full overflow-hidden bg-gray-100">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                          </div>
                          <span className="font-semibold text-sm" style={{ color: g.color }}>{pct.toFixed(1)}%</span>
                        </div>
                      </Td>
                      <Td>
                        <span className="badge" style={{ background: g.bg, color: g.color }}>{g.grade}</span>
                      </Td>
                      <Td><span className="text-gray-500 text-sm">{r.feedback || '—'}</span></Td>
                    </tr>
                  );
                })}
              </Table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {results.map((r) => {
                const pct = ((r.marksObtained / r.exam.maxMarks) * 100);
                const g = gradeColor(pct);
                return (
                  <div key={r.id} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm">{r.exam.name}</p>
                        <p className="text-xs text-gray-500">{new Date(r.exam.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className="badge" style={{ background: g.bg, color: g.color }}>{g.grade}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: g.color }}>{pct.toFixed(0)}%</span>
                      <span className="text-xs text-gray-500">{r.marksObtained}/{r.exam.maxMarks}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {results.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No results available yet.</div>}
          </>
        )}
      </Card>
    </div>
  );
};

export default Results;
