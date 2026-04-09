import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, FormInput, FormSelect, FormGrid, FormTextarea, Table, Td, LoadingSpinner } from '../../components/UI';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ courseId: '', question: '', options: ['', '', '', ''], correctIndex: 0, difficulty: 'MEDIUM', tags: '' });

  useEffect(() => {
    api.get('/courses').then(res => { setCourses(res.data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      api.get(`/online-exams/question-bank/${selectedCourse}`).then(res => setQuestions(res.data));
    }
  }, [selectedCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/online-exams/question-bank', { ...form, courseId: selectedCourse });
      setQuestions([res.data, ...questions]);
      setShowForm(false);
      setForm({ courseId: '', question: '', options: ['', '', '', ''], correctIndex: 0, difficulty: 'MEDIUM', tags: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const difficultyColors = {
    EASY: { bg: '#e6f6ef', color: '#2d9e6b' },
    MEDIUM: { bg: '#fef3c7', color: '#d97706' },
    HARD: { bg: '#fff0f1', color: '#e63946' },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Question Bank" subtitle="Manage MCQ questions for auto-generated exams" />
        <PrimaryButton onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Add Question'}</PrimaryButton>
      </div>

      <div className="mb-4">
        <FormSelect label="Select Course" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          <option value="">-- Choose Course --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </FormSelect>
      </div>

      {showForm && selectedCourse && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleSubmit}>
            <FormTextarea label="Question" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required rows={3} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="correct" checked={form.correctIndex === i}
                    onChange={() => setForm({ ...form, correctIndex: i })} className="w-4 h-4" style={{ accentColor: '#2d9e6b' }} />
                  <FormInput placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt}
                    onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }} required />
                </div>
              ))}
            </div>
            <FormGrid cols={2}>
              <FormSelect label="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </FormSelect>
              <FormInput label="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="algebra, chapter-1" />
            </FormGrid>
            <div className="mt-4"><PrimaryButton type="submit">Save Question</PrimaryButton></div>
          </form>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader title={`Questions (${questions.length})`} />
          <Table headers={['#', 'Question', 'Difficulty', 'Correct', 'Tags']}>
            {questions.map((q, i) => (
              <tr key={q.id}>
                <Td>{i + 1}</Td>
                <Td className="max-w-xs truncate">{q.question}</Td>
                <Td>
                  <span className="badge" style={difficultyColors[q.difficulty]}>{q.difficulty}</span>
                </Td>
                <Td className="font-bold" style={{ color: '#2d9e6b' }}>{String.fromCharCode(65 + q.correctIndex)}</Td>
                <Td className="text-xs text-gray-400">{q.tags || '-'}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
};

export default QuestionBank;