import { useState, useEffect } from 'react';
import api from '../../services/api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const studentRes = await api.get('/students/me');
        const studentId = studentRes.data.id;
        const res = await api.get(`/results/student/${studentId}`);
        setResults(res.data);
      } catch (err) {
        console.error('Failed to load results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <div>Loading results...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Exam Results</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {results.map(result => {
              const percentage = (result.marksObtained / result.exam.maxMarks) * 100;
              return (
                <tr key={result.id}>
                  <td className="px-6 py-4">{result.exam.name}</td>
                  <td className="px-6 py-4">{new Date(result.exam.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{result.exam.maxMarks}</td>
                  <td className="px-6 py-4">{result.marksObtained}</td>
                  <td className="px-6 py-4">{percentage.toFixed(2)}%</td>
                  <td className="px-6 py-4">{result.feedback || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Results;