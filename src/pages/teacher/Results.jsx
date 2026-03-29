import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormSelect, FormInput,
  GreenButton, LoadingSpinner, Table, Td,
} from '../../components/UI';

const TeacherResults = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    api.get('/teachers/me/batches').then(r => setBatches(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      setLoading(true);
      Promise.all([
        api.get(`/batches/${selectedBatch}/students`),
        api.get(`/exams?batchId=${selectedBatch}`),
      ]).then(([sRes, eRes]) => {
        setStudents(sRes.data);
        setExams(eRes.data || []);
        setSelectedExam('');
        setResults({});
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedExam && students.length > 0) {
      const init = {};
      students.forEach(s => { init[s.id] = { marks: '', feedback: '' }; });
      setResults(init);

      Promise.all(
        students.map(s =>
          api.get(`/results/student/${s.id}`).then(r => ({ studentId: s.id, results: r.data })).catch(() => ({ studentId: s.id, results: [] }))
        )
      ).then(allResults => {
        const updated = { ...init };
        allResults.forEach(({ studentId, results: sResults }) => {
          const match = sResults.find(r => r.examId === selectedExam);
          if (match) {
            updated[studentId] = { marks: String(match.marksObtained), feedback: match.feedback || '' };
          }
        });
        setResults(updated);
      });
    }
  }, [selectedExam]);

  const handleChange = (studentId, field, value) => {
    setResults(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handlePublish = async () => {
    const exam = exams.find(e => e.id === selectedExam);
    if (!exam) return;

    const entries = Object.entries(results)
      .filter(([, v]) => v.marks !== '')
      .map(([studentId, v]) => ({
        studentId,
        examId: selectedExam,
        marksObtained: parseFloat(v.marks),
        feedback: v.feedback || null,
      }));

    if (entries.length === 0) {
      setMsg('Please enter marks for at least one student.'); setIsError(true); return;
    }

    const invalid = entries.find(e => isNaN(e.marksObtained) || e.marksObtained < 0 || e.marksObtained > exam.maxMarks);
    if (invalid) {
      setMsg(`Marks must be between 0 and ${exam.maxMarks}.`); setIsError(true); return;
    }

    setPublishing(true); setMsg(''); setIsError(false);
    try {
      const res = await api.post('/results/bulk', { results: entries });
      setMsg(`✅ ${res.data.message || 'Results published successfully!'}`);
      setIsError(false);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to publish results.');
      setIsError(true);
    } finally { setPublishing(false); }
  };

  const batchName = batches.find(b => b.id === selectedBatch)?.name;
  const examObj = exams.find(e => e.id === selectedExam);
  const getStudentName = (s) => s.name || s.user?.name || s.user?.email || 'Unknown';

  return (
    <div className="space-y-5">
      <PageHeader title="Publish Results" subtitle="Enter and publish exam results for your students" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Select Batch" />
          <div className="p-5">
            <FormSelect value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
              <option value="">— Choose a batch —</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </FormSelect>
          </div>
        </Card>

        {selectedBatch && (
          <Card>
            <CardHeader title="Select Exam" />
            <div className="p-5">
              {exams.length === 0 ? (
                <p className="text-sm text-gray-400">No exams found for this batch.</p>
              ) : (
                <FormSelect value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                  <option value="">— Choose an exam —</option>
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} (Max: {e.maxMarks}) — {new Date(e.date).toLocaleDateString('en-IN')}
                    </option>
                  ))}
                </FormSelect>
              )}
            </div>
          </Card>
        )}
      </div>

      {!!msg && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{
            background: isError ? '#fff0f1' : '#e6f6ef',
            color: isError ? '#e63946' : '#2d9e6b',
            border: `1px solid ${isError ? '#fcc' : '#b7e9d0'}`,
          }}>
          {msg}
        </div>
      )}

      {loading && <LoadingSpinner />}

      {selectedExam && students.length > 0 && !loading && (
        <Card>
          <CardHeader title={`Enter Marks — ${batchName} / ${examObj?.name} (Max: ${examObj?.maxMarks})`} />

          {/* Desktop Table */}
          <div className="hidden sm:block">
            <Table headers={['#', 'Student', `Marks (/${examObj?.maxMarks})`, 'Feedback']}>
              {students.map((s, idx) => (
                <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                  <Td>{idx + 1}</Td>
                  <Td><span className="font-semibold">{getStudentName(s)}</span></Td>
                  <Td>
                    <input
                      type="number"
                      min="0"
                      max={examObj?.maxMarks}
                      value={results[s.id]?.marks || ''}
                      onChange={e => handleChange(s.id, 'marks', e.target.value)}
                      className="w-24 px-3 py-2 border rounded-xl text-sm"
                      style={{ borderColor: '#d1d5db' }}
                      placeholder="0"
                    />
                  </Td>
                  <Td>
                    <input
                      type="text"
                      value={results[s.id]?.feedback || ''}
                      onChange={e => handleChange(s.id, 'feedback', e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                      style={{ borderColor: '#d1d5db' }}
                      placeholder="Optional feedback"
                    />
                  </Td>
                </tr>
              ))}
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden p-4 space-y-3">
            {students.map((s, idx) => (
              <div key={s.id} className="p-4 rounded-xl" style={{ background: '#f8faff' }}>
                <p className="font-bold text-sm mb-2" style={{ color: '#1b3f7a' }}>
                  {idx + 1}. {getStudentName(s)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Marks (/{examObj?.maxMarks})</label>
                    <input
                      type="number"
                      min="0"
                      max={examObj?.maxMarks}
                      value={results[s.id]?.marks || ''}
                      onChange={e => handleChange(s.id, 'marks', e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                      style={{ borderColor: '#d1d5db' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Feedback</label>
                    <input
                      type="text"
                      value={results[s.id]?.feedback || ''}
                      onChange={e => handleChange(s.id, 'feedback', e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm mt-1"
                      style={{ borderColor: '#d1d5db' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t" style={{ borderColor: '#eaf0fb' }}>
            <GreenButton onClick={handlePublish} loading={publishing}>
              📊 Publish Results ({Object.values(results).filter(v => v.marks !== '').length} students)
            </GreenButton>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeacherResults;