import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, LoadingSpinner } from '../../components/UI';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    // Check in for streak
    api.post('/gamification/streak/checkin').then(res => setStreak(res.data)).catch(() => {});
    // This assumes batchId comes from user context; adjust as needed
    const batchId = localStorage.getItem('batchId');
    if (batchId) {
      api.get(`/gamification/leaderboard/${batchId}`).then(res => {
        setLeaderboard(res.data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <LoadingSpinner />;

  const medalEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div className="page-fade max-w-2xl mx-auto">
      <PageHeader title="Leaderboard" subtitle="See where you stand!" />

      {streak && (
        <Card className="p-5 mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#0f2447', fontFamily: 'Baloo 2, cursive' }}>🔥 Daily Streak</h3>
            <p className="text-gray-500 text-xs mt-1">Keep learning every day!</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: '#e63946' }}>{streak.currentStreak}</div>
            <div className="text-xs text-gray-400">days</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: '#1b3f7a' }}>{streak.longestStreak}</div>
            <div className="text-xs text-gray-400">best</div>
          </div>
        </Card>
      )}

      <Card>
        <div className="divide-y" style={{ borderColor: '#f0f4fc' }}>
          {leaderboard.map((s, i) => (
            <div key={s.studentId} className="flex items-center gap-4 px-5 py-4 transition-all hover:bg-blue-50/30">
              <div className="w-8 text-center">
                {i < 3 ? (
                  <span className="text-xl">{medalEmojis[i]}</span>
                ) : (
                  <span className="font-bold text-sm" style={{ color: '#94a3b8' }}>#{i + 1}</span>
                )}
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #1b3f7a 0%, #2a5bae 100%)' }}>
                {s.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#0f2447' }}>{s.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400">🔥 {s.currentStreak}d</span>
                  <span className="text-xs text-gray-400">🏆 {s.badgeCount}</span>
                  <span className="text-xs text-gray-400">📊 {s.avgScore}%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg" style={{ color: '#1b3f7a' }}>{s.points}</div>
                <div className="text-xs text-gray-400">pts</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;