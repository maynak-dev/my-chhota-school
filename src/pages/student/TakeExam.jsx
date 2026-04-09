import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, PrimaryButton, LoadingSpinner } from '../../components/UI';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/online-exams/${examId}`).then(res => {
      setExam(res.data);
      setTimeLeft(res.data.duration * 60);
      setLoading(false);
    }).catch(err => {
      alert(err.response?.data?.error || 'Cannot load exam');
      navigate(-1);
    });
  }, [examId, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // Tab switch detection (proctoring)
  useEffect(() => {
    if (!exam?.proctoring) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            alert('Warning: You have switched tabs 3 times. Your exam may be invalidated.');
          }
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [exam]);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      const res = await api.post(`/online-exams/${examId}/submit`, { answers, tabSwitches });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed');
    }
  }, [examId, answers, tabSwitches, submitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  if (result) {
    return (
      <div className="page-fade max-w-lg mx-auto mt-12">
        <Card className="p-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>
            Exam Submitted!
          </h2>
          <div className="text-4xl font-bold my-4" style={{ color: '#2d9e6b' }}>
            {result.score} / {result.totalMarks}
          </div>
          <p className="text-gray-500 text-sm">
            Percentage: {((result.score / result.totalMarks) * 100).toFixed(1)}%
          </p>
          {exam.proctoring && tabSwitches > 0 && (
            <p className="text-sm mt-2" style={{ color: '#e63946' }}>
              ⚠ Tab switches detected: {tabSwitches}
            </p>
          )}
          <PrimaryButton className="mt-6" onClick={() => navigate(-1)}>Go Back</PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-fade max-w-3xl mx-auto">
      {/* Sticky Timer Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 rounded-2xl mb-6"
        style={{ background: 'linear-gradient(135deg, #1b3f7a 0%, #2a5bae 100%)', boxShadow: '0 4px 20px rgba(27,63,122,0.3)' }}>
        <div>
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Baloo 2, cursive' }}>{exam.title}</h2>
          <p className="text-blue-200 text-xs">{exam.questions.length} questions · {exam.duration} min</p>
        </div>
        <div className="text-right">
          <div className="text-white text-2xl font-bold font-mono"
            style={{ color: timeLeft < 60 ? '#ff6b6b' : '#fff' }}>
            ⏱ {formatTime(timeLeft)}
          </div>
          {exam.proctoring && tabSwitches > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(230,57,70,0.3)', color: '#ff6b6b' }}>
              Tab switches: {tabSwitches}
            </span>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {exam.questions.map((q, qi) => (
          <Card key={q.id} className="p-5">
            <p className="font-semibold text-sm mb-3" style={{ color: '#0f2447' }}>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-2"
                style={{ background: answers[q.id] !== undefined ? '#e6f6ef' : '#e0e7ff', color: answers[q.id] !== undefined ? '#2d9e6b' : '#1b3f7a' }}>
                {qi + 1}
              </span>
              {q.question}
            </p>
            <div className="space-y-2 ml-9">
              {q.options.map((opt, oi) => (
                <label key={oi}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-sm"
                  style={{
                    background: answers[q.id] === oi ? '#eef2ff' : '#fafafa',
                    border: `1.5px solid ${answers[q.id] === oi ? '#1b3f7a' : '#e5e7eb'}`,
                  }}>
                  <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === oi}
                    onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                    className="w-4 h-4" style={{ accentColor: '#1b3f7a' }} />
                  <span style={{ color: '#374151' }}>{String.fromCharCode(65 + oi)}. {opt}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 mb-10 text-center">
        <PrimaryButton onClick={handleSubmit}>Submit Exam</PrimaryButton>
        <p className="text-xs text-gray-400 mt-2">
          Answered: {Object.keys(answers).length}/{exam.questions.length}
        </p>
      </div>
    </div>
  );
};

export default TakeExam;