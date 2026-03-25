import { useState } from 'react';

const LessonPlanner = () => {
  const [date, setDate] = useState('');
  const [topic, setTopic] = useState('');
  const [objectives, setObjectives] = useState('');
  const [activities, setActivities] = useState('');
  const [plans, setPlans] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPlan = { date, topic, objectives, activities };
    setPlans([...plans, newPlan]);
    setDate('');
    setTopic('');
    setObjectives('');
    setActivities('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lesson Planner</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded w-full" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Topic</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="border p-2 rounded w-full" required />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Learning Objectives</label>
            <textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} rows="3" className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Activities</label>
            <textarea value={activities} onChange={(e) => setActivities(e.target.value)} rows="3" className="border p-2 rounded w-full" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Plan</button>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="text-lg font-semibold p-4 border-b">Lesson Plans</h2>
        {plans.length === 0 ? (
          <p className="p-4 text-gray-500">No lesson plans added yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectives</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4">{plan.date}</td>
                  <td className="px-6 py-4">{plan.topic}</td>
                  <td className="px-6 py-4">{plan.objectives}</td>
                  <td className="px-6 py-4">{plan.activities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LessonPlanner;