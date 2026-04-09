import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, GreenButton, FormInput, FormSelect, FormGrid, FormTextarea, Table, Td, LoadingSpinner } from '../../components/UI';

const OnlineExams = () => {
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [mode, setMode] = useState('manual'); // manual | generate
  const [form, setForm] = useState({
    title: '', batchId: '', duration: 30, totalMarks: 10, randomize: false, proctoring: false,
    startTime: '', endTime: '', courseId: '', count: 10, difficulty: '',
  });
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctIndex: 0, marks: 1 }]);

  useEffect(() => {
    Promise.all([api.get('/batches'), api.get('/courses')]).then(([b, c]) => {
      setBatches(b.data);
      setCourses(c.data);
      setLoading(false);
    });
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctIndex: 0, marks: 1 }]);
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    if (field === 'option') {
      updated[idx].options[value.index] = value.text;
    } else {
      updated[idx][field] = value;
    }
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'generate') {
        await api.post('/online-exams/generate', form);
      } else {
        await api.post('/online-exams', { ...form, totalMarks: questions.reduce((s, q) => s + q.marks, 0), questions });
      }
      alert('Exam created successfully!');
      setShowCreate(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create exam');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Online Exams" subtitle="Create MCQ-based timer exams with auto-evaluation" />
        <PrimaryButton onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? '✕ Cancel' : '+ Create Exam'}
        </PrimaryButton>
      </div>

      {showCreate && (
        <Card className="p-5 mb-6">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode('manual')}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: mode === 'manual' ? '#1b3f7a' : '#e0e7ff', color: mode === 'manual' ? '#fff' : '#1b3f7a' }}>
              Manual Questions
            </button>
            <button onClick={() => setMode('generate')}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: mode === 'generate' ? '#1b3f7a' : '#e0e7ff', color: mode === 'generate' ? '#fff' : '#1b3f7a' }}>
              Auto-Generate from Bank
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <FormGrid cols={2}>
              <FormInput label="Exam Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <FormSelect label="Batch" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} required>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </FormSelect>
              <FormInput label="Duration (minutes)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} />
              <FormInput label="Start Time" type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
              <FormInput label="End Time" type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
              <div className="flex items-center gap-6 mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.randomize} onChange={e => setForm({ ...form, randomize: e.target.checked })}
                    className="w-4 h-4 rounded" style={{ accentColor: '#1b3f7a' }} />
                  <span className="text-sm font-semibold" style={{ color: '#374151' }}>Randomize Questions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.proctoring} onChange={e => setForm({ ...form, proctoring: e.target.checked })}
                    className="w-4 h-4 rounded" style={{ accentColor: '#e63946' }} />
                  <span className="text-sm font-semibold" style={{ color: '#374151' }}>Tab Switch Detection</span>
                </label>
              </div>
            </FormGrid>

            {mode === 'generate' && (
              <div className="mt-4">
                <FormGrid cols={3}>
                  <FormSelect label="Course (Question Bank)" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </FormSelect>
                  <FormInput label="Number of Questions" type="number" value={form.count} onChange={e => setForm({ ...form, count: parseInt(e.target.value) })} />
                  <FormSelect label="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="">All</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </FormSelect>
                </FormGrid>
              </div>
            )}

            {mode === 'manual' && (
              <div className="mt-6 space-y-4">
                <h3 className="font-bold text-base" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>Questions</h3>
                {questions.map((q, qi) => (
                  <div key={qi} className="p-4 rounded-xl" style={{ background: '#f8faff', border: '1px solid #eaf0fb' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm" style={{ color: '#1b3f7a' }}>Q{qi + 1}</span>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}
                          className="text-xs font-bold px-2 py-1 rounded" style={{ color: '#e63946' }}>Remove</button>
                      )}
                    </div>
                    <FormTextarea label="Question" value={q.question} rows={2}
                      onChange={e => updateQuestion(qi, 'question', e.target.value)} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi}
                            onChange={() => updateQuestion(qi, 'correctIndex', oi)}
                            className="w-4 h-4" style={{ accentColor: '#2d9e6b' }} />
                          <input className="form-input flex-1 px-3 py-2 border rounded-lg text-sm"
                            style={{ borderColor: '#d1d5db', background: '#fff' }}
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                            value={opt}
                            onChange={e => updateQuestion(qi, 'option', { index: oi, text: e.target.value })} required />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <FormInput label="Marks" type="number" value={q.marks}
                        onChange={e => updateQuestion(qi, 'marks', parseInt(e.target.value))} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addQuestion}
                  className="text-sm font-bold px-4 py-2 rounded-xl transition-all"
                  style={{ background: '#e0e7ff', color: '#1b3f7a' }}>
                  + Add Question
                </button>
              </div>
            )}

            <div className="mt-6">
              <PrimaryButton type="submit">Create Exam</PrimaryButton>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default OnlineExams;