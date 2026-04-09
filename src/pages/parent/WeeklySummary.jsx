import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, LoadingSpinner } from '../../components/UI';

const WeeklySummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem('childStudentId');
    if (studentId) {
      api.get(`/parent-engagement/weekly-summary/${studentId}`).then(res => {
        setSummary(res.data);
        setLoading(false);
      });
    }
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!summary) return <div className="text-center py-12 text-gray-400">No data available</div>;

  return (
    <div className="page-fade max-w-2xl mx-auto">
      <PageHeader title="Weekly Summary" subtitle="Your child's performance this week" />

      {/* Attendance Card */}
      <Card className="p-5 mb-4">
        <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>📋 Attendance</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#e0e7ff' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${summary.attendance.rate}%`,
                background: parseFloat(summary.attendance.rate) >= 75 ? '#2d9e6b' : '#e63946',
              }} />
            </div>
          </div>
          <span className="text-2xl font-bold" style={{ color: parseFloat(summary.attendance.rate) >= 75 ? '#2d9e6b' : '#e63946' }}>
            {summary.attendance.rate}%
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Present {summary.attendance.present}/{summary.attendance.total} days</p>
      </Card>

      {/* Results */}
      <Card className="p-5 mb-4">
        <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>📝 Recent Results</h3>
        {summary.recentResults.length > 0 ? (
          <div className="space-y-2">
            {summary.recentResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: '#f8faff' }}>
                <span className="text-sm font-semibold" style={{ color: '#374151' }}>{r.exam}</span>
                <div className="text-right">
                  <span className="text-sm font-bold" style={{ color: parseFloat(r.percentage) >= 60 ? '#2d9e6b' : '#e63946' }}>
                    {r.marks}/{r.total}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">({r.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No recent results</p>
        )}
      </Card>

      {/* Video engagement */}
      <Card className="p-5">
        <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>📹 Video Learning</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ background: '#e0e7ff' }}>
            <div className="text-2xl font-bold" style={{ color: '#1b3f7a' }}>{summary.videosWatched}</div>
            <div className="text-xs text-gray-500 mt-1">Watched</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: '#e6f6ef' }}>
            <div className="text-2xl font-bold" style={{ color: '#2d9e6b' }}>{summary.videosCompleted}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WeeklySummary;