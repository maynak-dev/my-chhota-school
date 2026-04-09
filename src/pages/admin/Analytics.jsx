import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormSelect, Table, Td, LoadingSpinner } from '../../components/UI';

const Analytics = () => {
  const [tab, setTab] = useState('student');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [studentMetrics, setStudentMetrics] = useState([]);
  const [teacherMetrics, setTeacherMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/batches').then(res => { setBatches(res.data); setLoading(false); });
    api.get('/analytics/teacher-performance').then(res => setTeacherMetrics(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      api.get(`/analytics/student-engagement/${selectedBatch}`).then(res => setStudentMetrics(res.data));
    }
  }, [selectedBatch]);

  const getColor = (val) => {
    const n = parseFloat(val);
    if (n >= 80) return '#2d9e6b';
    if (n >= 60) return '#d97706';
    return '#e63946';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <PageHeader title="Analytics Dashboard" subtitle="Student engagement, drop-off & teacher performance" />

      <div className="flex gap-2 mb-6">
        {['student', 'teacher'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize"
            style={{ background: tab === t ? '#1b3f7a' : '#e0e7ff', color: tab === t ? '#fff' : '#1b3f7a' }}>
            {t} Metrics
          </button>
        ))}
      </div>

      {tab === 'student' && (
        <>
          <div className="mb-4">
            <FormSelect label="Batch" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
              <option value="">Select Batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </FormSelect>
          </div>
          {selectedBatch && (
            <Card>
              <CardHeader title="Student Engagement Metrics" />
              <Table headers={['Student', 'Roll No', 'Attendance', 'Videos Watched', 'Completed', 'Completion Rate']}>
                {studentMetrics.map(s => (
                  <tr key={s.studentId}>
                    <Td className="font-semibold">{s.name}</Td>
                    <Td>{s.rollNumber}</Td>
                    <Td><span className="font-bold" style={{ color: getColor(s.attendanceRate) }}>{s.attendanceRate}%</span></Td>
                    <Td>{s.videosWatched}</Td>
                    <Td>{s.videosCompleted}</Td>
                    <Td><span className="font-bold" style={{ color: getColor(s.completionRate) }}>{s.completionRate}%</span></Td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}
        </>
      )}

      {tab === 'teacher' && (
        <Card>
          <CardHeader title="Teacher Performance" />
          <Table headers={['Teacher', 'Subject', 'Students', 'Batches', 'Attendance Rate', 'Avg Student Score']}>
            {teacherMetrics.map(t => (
              <tr key={t.teacherId}>
                <Td className="font-semibold">{t.name}</Td>
                <Td>{t.subject}</Td>
                <Td>{t.totalStudents}</Td>
                <Td>{t.batchCount}</Td>
                <Td><span className="font-bold" style={{ color: getColor(t.classAttendanceRate) }}>{t.classAttendanceRate}%</span></Td>
                <Td><span className="font-bold" style={{ color: getColor(t.avgStudentScore) }}>{t.avgStudentScore}%</span></Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Analytics;