import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const statConfig = {
  ADMIN: [
    { key: 'totalStudents', label: 'Total Students', icon: '🎒', color: '#1b3f7a', bg: '#e8f0fe' },
    { key: 'totalTeachers', label: 'Total Teachers', icon: '👩‍🏫', color: '#2d9e6b', bg: '#e6f6ef' },
    { key: 'totalBatches', label: 'Total Batches', icon: '📚', color: '#f59e0b', bg: '#fef3c7' },
    { key: 'totalFeesCollected', label: 'Fees Collected', icon: '💰', color: '#e63946', bg: '#fff0f1', prefix: '₹' },
    { key: 'attendanceToday', label: 'Attendance Today', icon: '✅', color: '#8b5cf6', bg: '#f0ebff' },
  ],
  SUB_ADMIN: [
    { key: 'students', label: 'Students in Batch', icon: '🎒', color: '#1b3f7a', bg: '#e8f0fe' },
    { key: 'assignments', label: 'Assignments', icon: '📝', color: '#f59e0b', bg: '#fef3c7' },
    { key: 'attendanceToday', label: 'Attendance Today', icon: '✅', color: '#2d9e6b', bg: '#e6f6ef' },
  ],
  STUDENT: [
    { key: 'attendanceCount', label: 'Attendance Days', icon: '📅', color: '#1b3f7a', bg: '#e8f0fe' },
    { key: 'assignmentsCount', label: 'Assignments', icon: '📝', color: '#f59e0b', bg: '#fef3c7' },
    { key: 'feeDue', label: 'Fee Due', icon: '💳', color: '#e63946', bg: '#fff0f1', prefix: '₹' },
  ],
};

const StatCard = ({ label, value, icon, color, bg, prefix }) => (
  <div
    className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:scale-105 hover:shadow-lg"
    style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}
  >
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: bg }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p
        className="text-2xl font-bold truncate"
        style={{ fontFamily: 'Baloo 2, cursive', color }}
      >
        {prefix || ''}{value ?? '—'}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let res;
        if (user.role === 'ADMIN') res = await api.get('/dashboard/admin');
        else if (user.role === 'SUB_ADMIN') res = await api.get('/dashboard/teacher');
        else if (user.role === 'STUDENT') res = await api.get('/dashboard/student');
        else if (user.role === 'PARENT') res = await api.get('/dashboard/parent');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const cards = statConfig[user.role] || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}
        >
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening in your school today.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-24 animate-pulse" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
              <div className="flex gap-4 items-center h-full">
                <div className="w-14 h-14 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-24" />
                  <div className="h-6 bg-gray-100 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.role === 'PARENT' ? (
            <StatCard
              label="Children Enrolled"
              value={stats?.children?.length || 0}
              icon="👨‍👩‍👧"
              color="#1b3f7a"
              bg="#e8f0fe"
            />
          ) : (
            cards.map((card) => (
              <StatCard key={card.key} {...card} value={stats?.[card.key]} />
            ))
          )}
        </div>
      )}

      {/* Parent children list */}
      {user.role === 'PARENT' && stats?.children?.length > 0 && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
          <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>
            Your Children
          </h2>
          <div className="space-y-3">
            {stats.children.map((child, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8faff' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: '#2d9e6b' }}>
                  {child?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{child?.name}</p>
                  <p className="text-xs text-gray-500">{child?.batch?.name || 'No batch assigned'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick info card */}
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #0f2447 0%, #1b3f7a 100%)', boxShadow: '0 4px 20px rgba(15,36,71,0.25)' }}
      >
        <div className="text-3xl">🏫</div>
        <div>
          <p className="text-white font-bold text-base" style={{ fontFamily: 'Baloo 2, cursive' }}>
            My Chhota School ERP
          </p>
          <p className="text-blue-200 text-sm">
            Manage your school efficiently. All data is secure and up to date.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
